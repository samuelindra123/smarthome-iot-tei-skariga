'use client';
import AuthGuard from '@/components/AuthGuard';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { MqttClient } from 'mqtt';
import { PRESENCE_TOPIC as SHARED_PRESENCE_TOPIC, presenceFromPayload, evaluateTimeout, PresenceModel } from '@/lib/presence';
import { useMqtt } from '@/lib/mqtt';

// CONFIG (sender / broker marker)
// Fixed production broker WSS endpoint (override previous env-based host/port)
const BROKER_URL = 'wss://mqtt.tecnoverse.app:8081';
const SENDER_CLIENT_ID = 'WEB_MONITOR_DASH'; // penanda pengirim / client id web
const DEVICE_CLIENT_ID = 'ESP32_S2_MINI_01'; // harus cocok dengan firmware
const PRESENCE_TIMEOUT_MS = 30_000; // auto offline setelah 30s tanpa pesan

// Topics of interest
const STATUS_TOPICS = [
  'smarthome/lampu1/status',
  'smarthome/lampu2/status',
  'smarthome/stopkontak1/status',
  'smarthome/stopkontak2/status'
];
// Tambah constant presence topic (sinkron dengan firmware)
const PRESENCE_TOPIC = SHARED_PRESENCE_TOPIC; // unify with shared util

interface DeviceStatusRec {
  topic: string;
  lastPayload: string | null;
  lastUpdated: number | null; // epoch ms
  retained?: boolean;
}

interface PresenceState {
  connected: boolean;       // device appears via status retained or new publish
  lastSeen: number | null;  // timestamp last message
  lastDeltaSec: number;     // computed periodically for UI
}

export default function MonitorPage() {
  const { client } = useMqtt();
  const clientRef = useRef<MqttClient | null>(null);
  const [connecting, setConnecting] = useState(true);
  // Removed error state (unused) to satisfy ESLint
  const [, setError] = useState<string | null>(null);
  const [presenceState, setPresenceState] = useState<PresenceModel>({ state: 'unknown', lastSeen: null });
  const [presence, setPresence] = useState<PresenceState>({ connected: false, lastSeen: null, lastDeltaSec: 0 }); // legacy local usage for existing UI fields
  const [statuses, setStatuses] = useState<Record<string, DeviceStatusRec>>(() => {
    const base: Record<string, DeviceStatusRec> = {};
    STATUS_TOPICS.forEach(t => { base[t] = { topic: t, lastPayload: null, lastUpdated: null }; });
    return base;
  });
  const [messages, setMessages] = useState<Array<{ topic:string; payload:string; ts:number; retained:boolean }>>([]);
  const [seq, setSeq] = useState(0);
  const [presencePayload, setPresencePayload] = useState<string | null>(null);

  // Derived device ON/OFF summary (lampu & stopkontak) from latest status topics
  const summary = {
    lampu1: statuses['smarthome/lampu1/status']?.lastPayload || 'UNKNOWN',
    lampu2: statuses['smarthome/lampu2/status']?.lastPayload || 'UNKNOWN',
    stopkontak1: statuses['smarthome/stopkontak1/status']?.lastPayload || 'UNKNOWN',
    stopkontak2: statuses['smarthome/stopkontak2/status']?.lastPayload || 'UNKNOWN'
  };

  // Age timer + auto offline
  useEffect(() => {
    const id = setInterval(() => {
      setPresenceState(p => evaluateTimeout(p));
      setPresence(p => {
        if (!p.lastSeen) return { ...p, lastDeltaSec: 0 };
        const deltaMs = Date.now() - p.lastSeen;
        const offline = deltaMs > PRESENCE_TIMEOUT_MS;
        return { connected: offline ? false : p.connected, lastSeen: p.lastSeen, lastDeltaSec: Math.floor(deltaMs/1000) };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const connectMqtt = useCallback(() => {
    if (!client) return;
    if (clientRef.current) return;
    clientRef.current = client;
    setConnecting(false); setError(null);
    client.subscribe(STATUS_TOPICS);
    client.subscribe('$SYS/broker/clients/connected');
    client.subscribe(PRESENCE_TOPIC);

    client.on('message', (topic, payloadBuf, packet) => {
      const payload = payloadBuf.toString();
      const retained = !!packet.retain;
      const now = Date.now();

      if (STATUS_TOPICS.includes(topic)) {
        setStatuses(prev => {
          const next = { ...prev };
            next[topic] = { topic, lastPayload: payload, lastUpdated: now, retained };
          return next;
        });
        // Treat status as heartbeat refresh (do not revive if explicit offline from LWT)
        setPresence(p => ({ connected: true, lastSeen: now, lastDeltaSec: 0 }));
        setPresenceState(ps => ps.state === 'offline' ? ps : { ...ps, state: ps.state === 'unknown' ? 'online' : ps.state, lastSeen: now, source: 'status' });
      }

      // presence payload
      if (topic === PRESENCE_TOPIC) {
        setPresencePayload(payload);
        const meta = presenceFromPayload(payload);
        setPresenceState(ps => ({
          ...ps,
          state: meta.state,
          lastSeen: meta.state === 'online' ? Date.now() : ps.lastSeen,
          source: meta.source,
          lastPayload: payload,
          reason: meta.state === 'offline' ? 'LWT/offline signal' : undefined
        }));
        if (meta.state === 'online') setPresence(p => ({ connected: true, lastSeen: Date.now(), lastDeltaSec: 0 }));
        if (meta.state === 'offline') setPresence(p => ({ ...p, connected: false }));
      }

      setMessages(m => {
        const list = [...m, { topic, payload, ts: now, retained }];
        if (list.length > 150) list.shift();
        return list;
      });
      setSeq(s => s + 1);
    });

    client.on('error', (e) => { setError(e.message); });
    client.on('close', () => { setConnecting(true); });
  }, [client]);

  useEffect(() => { connectMqtt(); return () => { /* shared client persists */ }; }, [connectMqtt]);

  // Ping / echo state & logic
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState('Idle');
  const sendPing = () => {
    const c = clientRef.current; if (!c || pinging) return;
    setPinging(true); setPingResult('Sending...');
    const id = Date.now();
    const start = performance.now();
    const echoTopic = 'smarthome/device/ping/echo';
    const handler = (topic: string, payload: Buffer) => {
      if (topic === echoTopic) {
        try {
          const obj = JSON.parse(payload.toString());
          if (obj.id === id) {
            const latency = performance.now() - start;
            setPingResult(`Echo OK ${latency.toFixed(1)} ms`);
            setTimeout(()=> setPingResult('Idle'), 4000);
            c.removeListener('message', handler);
            setPinging(false);
          }
        } catch {}
      }
    };
    c.on('message', handler);
    try { c.publish('smarthome/device/ping', JSON.stringify({ id, from: SENDER_CLIENT_ID, t: Date.now() })); }
    catch { setPingResult('Failed publish'); setPinging(false); }
  };

  // Export snapshot JSON (presence + statuses + last messages)
  const exportSnapshot = () => {
    const blob = new Blob([JSON.stringify({
      generatedAt: new Date().toISOString(),
      broker: BROKER_URL,
      deviceClientId: DEVICE_CLIENT_ID,
      presence,
      summary,
      statuses,
      lastMessages: messages.slice(-50)
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'monitor-snapshot.json'; a.click();
    setTimeout(()=> URL.revokeObjectURL(url), 800);
  };

  return (
    <AuthGuard>
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white px-6 py-20">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">ESP32 Presence & Status Monitor</h1>
            <p className="text-gray-400 text-sm">Memantau konektivitas dan status ON/OFF perangkat melalui topik MQTT retained dan pesan real-time.</p>
            <div className="flex flex-wrap gap-2 text-[11px] text-gray-300">
              <span className="px-2 py-1 bg-gray-800/60 rounded border border-gray-700">Broker URL: {BROKER_URL}</span>
              <span className="px-2 py-1 bg-gray-800/60 rounded border border-gray-700">Web Client ID: {SENDER_CLIENT_ID}</span>
              <span className="px-2 py-1 bg-gray-800/60 rounded border border-gray-700">Device Client ID: {DEVICE_CLIENT_ID}</span>
            </div>
          </div>
          <nav className="flex gap-2 self-start md:self-center">
            <Link href="/control/esp32-s2-mini" className="px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold shadow shadow-yellow-500/30">Device Control</Link>
            <Link href="/control/esp32-s2-mini/voice" className="px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700">Voice Control</Link>
            <Link href="/control/esp32-s2-mini/metrics" className="px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700">Broker Metrics</Link>
            <span className="px-4 py-2 rounded-md bg-blue-600/80 text-white text-xs font-semibold border border-blue-500">Monitor</span>
          </nav>
        </header>

        {/* Presence Card */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="p-5 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col gap-3">
            <h2 className="font-semibold text-sm tracking-tight">Konektivitas Perangkat</h2>
            <div className="text-xs text-gray-300 space-y-1">
              <p>Status Dashboard → Broker: {connecting ? <span className="text-yellow-400">Connecting...</span> : <span className="text-green-400">Connected</span>}</p>
              <p>Presence ESP32: {presenceState.state === 'online' ? <span className="text-green-400">Online</span> : presenceState.state === 'offline' ? <span className="text-red-400">Offline</span> : <span className="text-gray-400">Unknown</span>}</p>
              <p>Presence Payload: {presencePayload ? <span className={presencePayload === 'online' ? 'text-green-400' : 'text-red-400'}>{presencePayload}</span> : <span className="text-gray-500">—</span>}</p>
              <p>Last Seen: {presence.lastSeen ? new Date(presence.lastSeen).toLocaleTimeString() : '—'}</p>
              <p>Age: {presence.lastSeen ? presence.lastDeltaSec + 's' : '—'}</p>
              <p>Presence Source: {presenceState.source || '—'}</p>
              {presenceState.reason && <p className="text-red-400">Reason: {presenceState.reason}</p>}
              <p>Total Pesan (session): {seq}</p>
            </div>
            <div className="mt-auto text-[10px] text-gray-500">Presence ditentukan dari retained / publish terbaru salah satu topik status. Auto-offline jika &gt; {PRESENCE_TIMEOUT_MS/1000}s tanpa pesan.</div>
          </div>

          {/* Summary ON/OFF */}
          <div className="p-5 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col gap-3 col-span-2">
            <h2 className="font-semibold text-sm tracking-tight">Ringkasan Status Channel</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              {Object.entries(summary).map(([k,v]) => (
                <div key={k} className="rounded-lg border border-gray-800 bg-gray-950/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">{k}</p>
                  <p className={`text-sm font-semibold ${v==='ON' ? 'text-green-400' : v==='OFF' ? 'text-red-400' : 'text-gray-500'}`}>{v}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-[10px] text-gray-500">Nilai &apos;UNKNOWN&apos; berarti belum ada retained / pesan diterima.</div>
              <button onClick={sendPing} disabled={pinging} className="text-[10px] px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50">Ping Device</button>
              <button onClick={exportSnapshot} className="text-[10px] px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700">Export Snapshot</button>
              <span className="text-[10px] text-gray-400">Ping: {pingResult}</span>
            </div>
          </div>
        </section>

        {/* Recent Messages */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-tight">Pesan Status Terbaru</h2>
          <div className="overflow-x-auto border border-gray-800 rounded-lg bg-gray-900/40">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-gray-800/60 text-gray-300">
                <tr>
                  <th className="px-3 py-2 border-b border-gray-700">Waktu</th>
                  <th className="px-3 py-2 border-b border-gray-700">Topik</th>
                  <th className="px-3 py-2 border-b border-gray-700">Payload</th>
                  <th className="px-3 py-2 border-b border-gray-700">Retained</th>
                </tr>
              </thead>
              <tbody>
                {messages.slice(-50).reverse().map(m => (
                  <tr key={m.ts+"-"+m.topic} className="hover:bg-gray-800/40">
                    <td className="px-3 py-1.5 border-b border-gray-800 whitespace-nowrap">{new Date(m.ts).toLocaleTimeString()}</td>
                    <td className="px-3 py-1.5 border-b border-gray-800 font-mono text-[10px] text-yellow-300">{m.topic}</td>
                    <td className={`px-3 py-1.5 border-b border-gray-800 font-semibold ${m.payload==='ON' ? 'text-green-400' : m.payload==='OFF' ? 'text-red-400' : 'text-gray-300'}`}>{m.payload}</td>
                    <td className="px-3 py-1.5 border-b border-gray-800">{m.retained ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
                {messages.length===0 && (
                  <tr><td colSpan={4} className="text-center py-6 text-gray-500 text-xs">Belum ada pesan status diterima.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Raw JSON Snapshot */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight">Snapshot JSON</h2>
          <pre className="text-[10px] bg-gray-950/80 rounded-lg p-3 border border-gray-800 overflow-x-auto">
            <code>{JSON.stringify({ presence, presencePayload, summary, statuses }, null, 2)}</code>
          </pre>
        </section>
      </div>
    </main>
    </AuthGuard>
  );
}
