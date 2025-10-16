"use client";
import AuthGuard from '@/components/AuthGuard';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useMqtt } from '@/lib/mqtt';

// Lightweight sparkline component (SVG) for small time-series metrics
function Sparkline({ data, stroke, label }: { data: number[]; stroke: string; label: string }) {
  const max = Math.max(1, ...data);
  const points = data.map((v, i) => `${(i / Math.max(1, data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-12">
        <polyline fill="none" stroke={stroke} strokeWidth={2} points={points} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}

interface LogEntry { ts: number; topic: string; payload: string; type: 'sys' | 'app'; }
interface MetricSample { t: number; messages?: number; bytesTotal?: number; }

// (Removed unused SYS_TOPICS constant to satisfy ESLint)

// Fixed production MQTT broker URL (secured WSS)
const MQTT_URL = 'wss://mqtt.tecnoverse.app:8081';

export default function BrokerMetricsPage() {
  const { client, subscribe, onMessage } = useMqtt();
  const [status, setStatus] = useState<'connecting' | 'online' | 'offline' | 'error'>('connecting');
  const [lastHeartbeat, setLastHeartbeat] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterText, setFilterText] = useState('');
  const [showSys, setShowSys] = useState(true);
  const [showApp, setShowApp] = useState(true);
  const [paused, setPaused] = useState(false); // pause streaming
  const [alert, setAlert] = useState<string | null>(null); // sudden drop alert
  const [sampleMessagesReceived, setSampleMessagesReceived] = useState<number[]>([]); // sparkline 1
  const [sampleClientsConnected, setSampleClientsConnected] = useState<number[]>([]); // sparkline 2
  const [sampleBytesPerSec, setSampleBytesPerSec] = useState<number[]>([]); // sparkline 3 (approx)
  const metricsRef = useRef<{ messagesReceived?: number; clientsConnected?: number; bytesReceived?: number; bytesSent?: number; lastBytes?: number; lastTime?: number; lastClients?: number }>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // big chart
  const [metricUpdatedAt, setMetricUpdatedAt] = useState<{ [k: string]: number }>({});
  const [samples, setSamples] = useState<MetricSample[]>([]); // for delta
  const [pingStatus, setPingStatus] = useState<string>('Idle');
  const seqRef = useRef<number>(0); // integrity sequence
  const [integrity, setIntegrity] = useState<{ seq: number; hash: number }>({ seq: 0, hash: 0 });

  // Derived filtered logs
  const filteredLogs = useMemo(() => logs.filter(l => {
    if (!showSys && l.type === 'sys') return false;
    if (!showApp && l.type === 'app') return false;
    if (filterText && !(`${l.topic} ${l.payload}`.toLowerCase().includes(filterText.toLowerCase()))) return false;
    return true;
  }), [logs, filterText, showSys, showApp]);

  // Load persisted logs
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('mqttLogs');
      if (saved) {
        const parsed: LogEntry[] = JSON.parse(saved);
        setLogs(parsed.slice(-500));
      }
    } catch {}
  }, []);

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mqtt-logs.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const clearLogs = () => { setLogs([]); try { sessionStorage.removeItem('mqttLogs'); } catch {} };
  // Big area chart drawing (messages, clients, bytes/sec) wrapped in useCallback
  const drawBigChart = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
    const h = canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.clearRect(0,0,w,h);
    const series = [
      { data: sampleMessagesReceived, color: '#fbbf24', label: 'Messages' },
      { data: sampleClientsConnected, color: '#34d399', label: 'Clients' },
      { data: sampleBytesPerSec, color: '#60a5fa', label: 'Bytes/sec' }
    ];
    const max = Math.max(1, ...series.flatMap(s=>s.data));
    const len = Math.max(...series.map(s=>s.data.length));
    const pad = 8;
    series.forEach(s => {
      if (!s.data.length) return;
      ctx.beginPath();
      s.data.forEach((v,i)=>{
        const x = pad + (i/(len-1))* (w/ (window.devicePixelRatio||1) - pad*2);
        const y = (h/(window.devicePixelRatio||1)-pad) - (v/max)*(h/(window.devicePixelRatio||1)-pad*2);
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.stroke();
      // area fill
  // lastX/lastY no longer needed directly; removed to clear unused warning
  // Close area path back to baseline
  ctx.lineTo(pad + ((s.data.length-1)/(len-1))* (w/(window.devicePixelRatio||1)-pad*2), h/(window.devicePixelRatio||1)-pad);
  ctx.lineTo(pad, h/(window.devicePixelRatio||1)-pad);
  ctx.closePath();
      const g = ctx.createLinearGradient(0,pad,0,h/(window.devicePixelRatio||1)-pad);
      g.addColorStop(0, s.color+'55');
      g.addColorStop(1, s.color+'00');
      ctx.fillStyle = g; ctx.fill();
    });
  }, [sampleMessagesReceived, sampleClientsConnected, sampleBytesPerSec]);

  // Redraw chart when samples change
  useEffect(()=>{ drawBigChart(); }, [drawBigChart]);

  // Subscribe + ingest metrics/messages
  useEffect(() => {
    if (!client) return;
    setStatus('online');
    const topics: string[] = ['$SYS/#','smarthome/#'];
    subscribe(topics);

    const off = onMessage((topic, payloadBuf) => {
      const payload = payloadBuf.toString();
      const isSys = topic.startsWith('$SYS/');
      const entry: LogEntry = { ts: Date.now(), topic, payload, type: isSys ? 'sys' : 'app' };
      if (!paused) {
        setLogs(prev => {
          const next = [...prev, entry];
          if (next.length > 500) next.splice(0, next.length - 500);
          try { sessionStorage.setItem('mqttLogs', JSON.stringify(next)); } catch {}
          return next;
        });
      }
      if (isSys) setLastHeartbeat(Date.now());

      const nowTs = Date.now();
      if (topic === '$SYS/broker/messages/received') { metricsRef.current.messagesReceived = Number(payload) || 0; setMetricUpdatedAt(m => ({ ...m, messages: nowTs })); }
      if (topic === '$SYS/broker/clients/connected') { metricsRef.current.clientsConnected = Number(payload) || 0; setMetricUpdatedAt(m => ({ ...m, clients: nowTs })); }
      if (topic === '$SYS/broker/bytes/received') { metricsRef.current.bytesReceived = Number(payload) || 0; setMetricUpdatedAt(m => ({ ...m, bytes: nowTs })); }
      if (topic === '$SYS/broker/bytes/sent') { metricsRef.current.bytesSent = Number(payload) || 0; setMetricUpdatedAt(m => ({ ...m, bytes: nowTs })); }

      seqRef.current += 1;
      setIntegrity(prev => {
        const h = ((prev.hash << 5) - prev.hash) ^ payload.charCodeAt(0) ^ topic.length ^ (seqRef.current & 0xffff);
        return { seq: seqRef.current, hash: h >>> 0 };
      });
    });

    const interval = setInterval(() => {
      const now = Date.now();
      const { messagesReceived, clientsConnected, bytesReceived, bytesSent, lastBytes, lastTime } = metricsRef.current;
      if (typeof bytesReceived === 'number' || typeof bytesSent === 'number') {
        const total = (bytesReceived || 0) + (bytesSent || 0);
        if (lastBytes != null && lastTime) {
          const dt = (now - lastTime) / 1000;
          const rate = dt > 0 ? (total - lastBytes) / dt : 0;
          setSampleBytesPerSec(prev => { const arr = [...prev, Math.max(0, Math.round(rate))]; if (arr.length > 30) arr.shift(); return arr; });
        }
        metricsRef.current.lastBytes = total;
        metricsRef.current.lastTime = now;
      }
      if (typeof messagesReceived === 'number') setSampleMessagesReceived(prev => { const arr = [...prev, messagesReceived]; if (arr.length > 30) arr.shift(); return arr; });
      if (typeof clientsConnected === 'number') {
        if (metricsRef.current.lastClients != null && clientsConnected < (metricsRef.current.lastClients - 1)) {
          setAlert(`Client turun dari ${metricsRef.current.lastClients} ke ${clientsConnected}`);
          setTimeout(() => setAlert(null), 8000);
        }
        metricsRef.current.lastClients = clientsConnected;
        setSampleClientsConnected(prev => { const arr = [...prev, clientsConnected]; if (arr.length > 30) arr.shift(); return arr; });
      }
      if (typeof messagesReceived === 'number') {
        const bytesTotal = (metricsRef.current.bytesReceived || 0) + (metricsRef.current.bytesSent || 0);
        setSamples(s => { const next = [...s, { t: now, messages: messagesReceived, bytesTotal }]; if (next.length > 40) next.shift(); return next; });
      }
      drawBigChart();
    }, 3000);

    return () => { off(); clearInterval(interval); };
  }, [client, paused, subscribe, onMessage, drawBigChart]);

  const brokerAgeSec = lastHeartbeat ? Math.round((Date.now() - lastHeartbeat) / 1000) : null;
  const brokerAlive = status === 'online' && brokerAgeSec !== null && brokerAgeSec < 10; // heartbeat within last 10s

  const ageText = (k: string) => {
    const t = metricUpdatedAt[k]; if (!t) return '—';
    const sec = ((Date.now() - t) / 1000).toFixed(1);
    return sec + 's ago';
  };

  const last10Raw = logs.slice(-10).reverse();

  // delta calculations (compare last two samples)
  const last = samples[samples.length -1];
  const prev = samples[samples.length -2];
  const deltaMessages = last && prev ? (last.messages! - (prev.messages||0)) : 0;
  const deltaBytes = last && prev ? (last.bytesTotal! - (prev.bytesTotal||0)) : 0;

  const sendPing = () => {
    if (!client) return;
    const id = Date.now();
    setPingStatus('Sending...');
    const topic = 'smarthome/test/ping';
    const echoTopic = 'smarthome/test/echo';
    const start = performance.now();
    const handler = (t: string, p: Buffer) => {
      if (t === echoTopic) {
        client.removeListener('message', handler);
        const latency = performance.now() - start;
        setPingStatus(`Echo OK (${latency.toFixed(1)} ms)`);
        setTimeout(()=> setPingStatus('Idle'), 4000);
      }
    };
    client.on('message', handler);
    try { client.publish(topic, JSON.stringify({ id })); } catch { setPingStatus('Failed publish'); }
  };

  return (
    <AuthGuard>
    <main className="min-h-screen px-6 py-14 bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">MQTT Broker Metrics & Logs</h1>
            <p className="text-sm text-gray-400 max-w-2xl">Monitor realtime Mosquitto broker ($SYS) dan aktivitas aplikasi (smarthome/#). Data dipotong ke 500 entri terakhir.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <Link href="/control/esp32-s2-mini" className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200">Device Control</Link>
            <Link href="/control/esp32-s2-mini/voice" className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200">Voice Control</Link>
            <span className="px-3 py-2 rounded-md bg-yellow-500 text-black shadow shadow-yellow-500/30">Broker Metrics</span>
            <Link href="/control/esp32-s2-mini/monitor" className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200">Monitor</Link>
          </div>
        </div>

        {/* Status + Mini Metrics */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60">
            <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Status Broker</div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span className={brokerAlive ? 'text-green-400' : status === 'connecting' ? 'text-yellow-400' : 'text-red-400'}>
                {brokerAlive ? 'ONLINE' : status.toUpperCase()}
              </span>
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: brokerAlive ? '#4ade80' : status === 'connecting' ? '#facc15' : '#f87171' }} />
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Heartbeat {brokerAgeSec != null ? brokerAgeSec + 's ago' : '—'}</div>
            <div className="mt-2 text-[10px] text-gray-500">Integrity seq {integrity.seq} • hash {integrity.hash.toString(16)}</div>
          </div>
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60">
            <Sparkline data={sampleMessagesReceived} stroke="#fbbf24" label="Messages (total)" />
            <div className="mt-1 text-[10px] text-gray-500">Updated {ageText('messages')}</div>
          </div>
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60">
            <Sparkline data={sampleClientsConnected} stroke="#34d399" label="Clients" />
            <div className="mt-1 text-[10px] text-gray-500">Updated {ageText('clients')}</div>
          </div>
            <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60">
            <Sparkline data={sampleBytesPerSec} stroke="#60a5fa" label="Bytes/sec" />
            <div className="mt-1 text-[10px] text-gray-500">Updated {ageText('bytes')}</div>
          </div>
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-wide text-gray-400">Ping / Validate</div>
            <button onClick={sendPing} className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-xs border border-gray-700">Kirim Ping</button>
            <div className="text-[10px] text-gray-400">Status: {pingStatus}</div>
            <div className="text-[10px] text-gray-500 leading-snug">Gunakan firmware echo untuk balas ke <code className="text-yellow-300">smarthome/test/echo</code></div>
          </div>
        </section>

        {/* Controls */}
        <section className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wide text-gray-400">Cari</label>
            <input value={filterText} onChange={e => setFilterText(e.target.value)} placeholder="filter topic/payload" className="bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring focus:ring-yellow-500/40" />
          </div>
          <label className="flex items-center gap-2 text-xs bg-gray-900 border border-gray-700 px-3 py-2 rounded">
            <input type="checkbox" checked={showSys} onChange={e => setShowSys(e.target.checked)} /> <span>$SYS</span>
          </label>
          <label className="flex items-center gap-2 text-xs bg-gray-900 border border-gray-700 px-3 py-2 rounded">
            <input type="checkbox" checked={showApp} onChange={e => setShowApp(e.target.checked)} /> <span>App</span>
          </label>
          <button onClick={exportLogs} className="text-xs px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700">Export JSON</button>
          <button onClick={clearLogs} className="text-xs px-3 py-2 rounded bg-red-600/80 hover:bg-red-600 border border-red-700">Clear</button>
          <button onClick={()=>setPaused(p=>!p)} className="text-xs px-3 py-2 rounded border border-gray-600 bg-gray-800 hover:bg-gray-700">{paused ? 'Resume' : 'Pause'}</button>
        </section>

        {alert && (
          <div className="p-3 rounded-md bg-red-900/40 border border-red-700 text-sm text-red-300 animate-pulse">ALERT: {alert}</div>
        )}

        {/* Big Composite Chart */}
        <section className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold tracking-wide text-gray-200">Tren Realtime (Area Chart)</h2>
            <div className="flex gap-3 text-[10px] uppercase tracking-wide">
              <span className="text-yellow-300">Messages</span>
              <span className="text-green-300">Clients</span>
              <span className="text-sky-300">Bytes/sec</span>
            </div>
          </div>
          <canvas ref={canvasRef} className="w-full h-52" />
        </section>

        {/* Deltas & Raw Messages */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 space-y-3">
            <h3 className="text-sm font-semibold tracking-wide text-gray-200">Delta (Sejak Sampel Terakhir)</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded bg-gray-950/40 border border-gray-800">
                <div className="text-[10px] uppercase text-gray-400">Δ Messages</div>
                <div className={`text-sm font-semibold ${deltaMessages >=0 ? 'text-yellow-300' : 'text-red-400'}`}>{deltaMessages}</div>
              </div>
              <div className="p-3 rounded bg-gray-950/40 border border-gray-800">
                <div className="text-[10px] uppercase text-gray-400">Δ Bytes</div>
                <div className={`text-sm font-semibold ${deltaBytes >=0 ? 'text-sky-300' : 'text-red-400'}`}>{deltaBytes}</div>
              </div>
              <div className="p-3 rounded bg-gray-950/40 border border-gray-800">
                <div className="text-[10px] uppercase text-gray-400">Samples</div>
                <div className="text-sm font-semibold text-gray-300">{samples.length}</div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 space-y-3">
            <h3 className="text-sm font-semibold tracking-wide text-gray-200">Raw Last 10 Messages</h3>
            <ul className="space-y-1 max-h-60 overflow-auto text-[11px] font-mono leading-relaxed">
              {last10Raw.map(r => (
                <li key={r.ts+ r.topic} className="flex gap-2"><span className="text-gray-500">{new Date(r.ts).toLocaleTimeString()}</span><span className={r.type==='sys'?'text-yellow-300':'text-green-300'}>{r.type}</span><span className="text-yellow-200 break-all">{r.topic}</span><span className={r.payload==='ON'?'text-green-400': r.payload==='OFF'?'text-red-400':'text-gray-300'}>{r.payload}</span></li>
              ))}
              {last10Raw.length===0 && <li className="text-gray-500">(Tidak ada pesan)</li>}
            </ul>
          </div>
        </section>

        {/* Logs Table */}
        <section>
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/80 text-gray-300 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2">Waktu</th>
                  <th className="px-3 py-2">Tipe</th>
                  <th className="px-3 py-2">Topik</th>
                  <th className="px-3 py-2">Payload</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {filteredLogs.slice().reverse().map(l => (
                  <tr key={l.ts + l.topic + l.payload} className="border-t border-gray-800/70 hover:bg-gray-800/30">
                    <td className="px-3 py-1.5 text-[11px] text-gray-400">{new Date(l.ts).toLocaleTimeString()}</td>
                    <td className="px-3 py-1.5 text-[11px]">{l.type === 'sys' ? <span className="text-yellow-300">SYS</span> : <span className="text-green-300">APP</span>}</td>
                    <td className="px-3 py-1.5 font-mono text-[11px] break-all text-yellow-200">{l.topic}</td>
                    <td className={"px-3 py-1.5 font-mono text-[11px] break-all " + (l.payload === 'ON' ? 'text-green-400' : l.payload === 'OFF' ? 'text-red-400' : 'text-gray-400')}>{l.payload}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-xs text-gray-500">Tidak ada log cocok.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
    </AuthGuard>
  );
}
