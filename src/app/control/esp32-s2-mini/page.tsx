"use client";

import { useEffect, useState, useMemo } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { PRESENCE_TOPIC, PresenceModel, presenceFromPayload, evaluateTimeout } from '@/lib/presence';
import { MqttClient } from 'mqtt';
import { DeviceStatus, Command } from '@/components/DeviceCard';
import Link from 'next/link';
import { useMqtt } from '@/lib/mqtt';

interface Device { id: string; name: string; }

// FIXED DEPLOY BROKER (overrides previous dynamic env-based discovery)
// If you need to revert to dynamic behaviour, restore previous getMqttUrl logic.
const MQTT_BROKER_URL: string = 'wss://mqtt.tecnoverse.app:8081';

const devices: Device[] = [
  { id: 'lampu1', name: 'Lampu Ruang Tamu' },
  { id: 'lampu2', name: 'Lampu Teras' },
  { id: 'stopkontak1', name: 'Stop Kontak TV' },
  { id: 'stopkontak2', name: 'Charger Pojok' },
];

export default function ControlEsp32S2MiniPage() {
  const { client, connected } = useMqtt();
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, DeviceStatus>>({ lampu1: '...', lampu2: '...', stopkontak1: '...', stopkontak2: '...' });
  const [history, setHistory] = useState<Array<{ ts:number; id:string; action:Command; statusAfter:DeviceStatus }>>([]);
  const [animating, setAnimating] = useState<Record<string, boolean>>({});
  // Realtime connection state flags
  const [reconnecting, setReconnecting] = useState(false);
  // Per-device temporary warning messages after blocked commands
  const [commandWarnings, setCommandWarnings] = useState<Record<string, { msg:string; ts:number }>>({});
  // Presence model (device-level, not broker connection)
  const [presence, setPresence] = useState<PresenceModel>({ state: 'unknown', lastSeen: null, lastPayload: null, source: undefined });

  // Periodic timeout evaluation for presence (reduced from 3s to 2s for faster response)
  useEffect(() => {
    const id = setInterval(() => {
      setPresence(p => evaluateTimeout(p));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!client) return;
    // Subscribe to device status topics AND presence topic (will receive retained messages)
    client.subscribe(['smarthome/+/status', PRESENCE_TOPIC], (err) => { 
      if (err) {
        console.error('Gagal subscribe:', err);
      } else {
        console.log('✅ Subscribed to device status and presence topics');
      }
    });
    const handler = (topic: string, message: Buffer) => {
      const deviceId = topic.split('/')[1];
      const newStatus = message.toString() as DeviceStatus;
      if (topic.startsWith('smarthome/') && topic.endsWith('/status')) {
        setDeviceStatuses(prev => ({ ...prev, [deviceId]: newStatus }));
        setHistory(h => {
          if (!devices.find(d=>d.id===deviceId)) return h;
          const last = h[h.length-1];
          if (last && last.id===deviceId && last.statusAfter===newStatus) return h;
          return [...h, { ts: Date.now(), id: deviceId, action: newStatus as Command, statusAfter: newStatus }].slice(-80);
        });
        setAnimating(a=>({ ...a, [deviceId]: true }));
        setTimeout(()=> setAnimating(a=> ({ ...a, [deviceId]: false })), 600);
        // DO NOT update presence from status messages - only follow explicit presence topic!
        // Status messages are just for device state (ON/OFF), not for presence detection.
      } else if (topic === PRESENCE_TOPIC) {
        const payload = message.toString();
        const meta = presenceFromPayload(payload);
        
        // INSTANT presence detection from MQTT - this is the ONLY source of truth
        setPresence({
          state: meta.state,
          // Update lastSeen only when online, preserve it when offline (for timeout calculation)
          lastSeen: meta.state === 'online' ? Date.now() : (meta.source === 'lwt' ? null : Date.now()),
          lastPayload: payload,
          source: meta.source,
          reason: meta.state === 'offline' ? 'Device disconnected (MQTT LWT)' : undefined
        });
        
        console.log(`📡 Presence from MQTT: ${meta.state} (source: ${meta.source})`);
      }
    };
    client.on('message', handler);
    return () => { try { client.removeListener('message', handler); } catch {} };
  }, [client]);

  const handleControl = (deviceId: string, command: Command) => {
    // Block command if broker not connected yet
    if (!client || !client.connected || !connected) {
      setCommandWarnings(w => ({ ...w, [deviceId]: { msg: 'Tidak terkoneksi ke broker. Perintah dibatalkan.', ts: Date.now() } }));
      setTimeout(() => setCommandWarnings(w => {
        const copy = { ...w }; Object.entries(copy).forEach(([id, val]) => { if (Date.now() - val.ts > 3000) delete copy[id]; }); return copy;
      }), 3200);
      return;
    }
    // Block if device is offline (based on MQTT presence)
    if (presence.state !== 'online') {
      setCommandWarnings(w => ({ ...w, [deviceId]: { msg: 'Device offline. Tidak dapat mengirim perintah.', ts: Date.now() } }));
      setTimeout(() => setCommandWarnings(w => {
        const copy = { ...w }; Object.entries(copy).forEach(([id, val]) => { if (Date.now() - val.ts > 3000) delete copy[id]; }); return copy;
      }), 3200);
      return;
    }
    // Block if belum menerima retained status untuk device tersebut
    if (deviceStatuses[deviceId] === '...') {
      setCommandWarnings(w => ({ ...w, [deviceId]: { msg: 'Status perangkat belum diterima. Tunggu sinkronisasi...', ts: Date.now() } }));
      setTimeout(() => setCommandWarnings(w => {
        const copy = { ...w }; Object.entries(copy).forEach(([id, val]) => { if (Date.now() - val.ts > 3000) delete copy[id]; }); return copy;
      }), 3200);
      return;
    }
    const topic = `smarthome/${deviceId}/perintah`;
    console.log(`Mengirim perintah ${command} ke ${topic}`);
  client.publish(topic, command);
    setHistory(h => [...h, { ts: Date.now(), id: deviceId, action: command, statusAfter: deviceStatuses[deviceId] }].slice(-80));
  };

  const prettyName = (id:string) => devices.find(d=>d.id===id)?.name || id;
  const connectionState = useMemo(()=> {
    if (!connected) return 'disconnected';
    return Object.values(deviceStatuses).every(s=> s==='...' ) ? 'connecting' : 'ready';
  }, [deviceStatuses, connected]);

  const statusChip = (s:DeviceStatus) => {
    if (s==='...') return <span className="px-2 py-0.5 text-[10px] rounded bg-gray-700/60 text-gray-300">...</span>;
    return <span className={`px-2 py-0.5 text-[10px] rounded font-medium ${s==='ON' ? 'bg-green-500/20 text-green-300 border border-green-600/40' : 'bg-red-500/20 text-red-300 border border-red-600/40'}`}>{s}</span>;
  };

  return (
    <AuthGuard>
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white px-4 md:px-8 py-14">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col lg:flex-row lg:items-end gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">ESP32 Relay Control</h1>
              {/* Real-time Broker Status */}
              {connectionState==='disconnected' ? (
                <span className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-[10px] border border-red-600/40 animate-pulse">Broker Disconnected</span>
              ) : (
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-[10px] border border-green-600/40">Broker Connected</span>
              )}
              {/* Real-time Device Presence */}
              {presence.state==='offline' && <span className="px-2 py-1 rounded bg-red-600/30 text-red-200 text-[10px] border border-red-500/50 animate-pulse">Device Offline</span>}
              {presence.state==='unknown' && connectionState!=='disconnected' && <span className="px-2 py-1 rounded bg-gray-600/30 text-gray-200 text-[10px] border border-gray-500/50">Presence Unknown</span>}
              {presence.state==='online' && <span className="px-2 py-1 rounded bg-green-600/30 text-green-200 text-[10px] border border-green-500/50">Device Online</span>}
              {/* Syncing status for first load */}
              {connectionState==='connecting' && <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 text-[10px] border border-yellow-600/40 animate-pulse">Syncing...</span>}
            </div>
            <p className="text-sm md:text-base text-gray-400 max-w-2xl leading-relaxed">Pengendalian realtime 4 kanal relay (2 lampu & 2 stopkontak) melalui MQTT WebSocket. Panel kiri untuk aksi, panel kanan mensimulasikan keadaan perangkat seperti lingkungan mini Wokwi.</p>
            <div className="flex flex-wrap gap-3 text-[11px] text-gray-300">
              <span className={`px-2 py-1 rounded border ${connected ? 'bg-green-800/40 border-green-700 text-green-300' : 'bg-red-800/40 border-red-700 text-red-300'}`}>
                Broker: {connected ? '✓ Connected' : '✗ Disconnected'}
              </span>
              <span className={`px-2 py-1 rounded border ${presence.state === 'online' ? 'bg-green-800/40 border-green-700 text-green-300' : presence.state === 'offline' ? 'bg-red-800/40 border-red-700 text-red-300' : 'bg-gray-800/60 border-gray-700'}`}>
                Device: {presence.state.toUpperCase()}
              </span>
              {presence.source && <span className="px-2 py-1 rounded bg-gray-800/60 border border-gray-700">Source: {presence.source}</span>}
              {presence.reason && <span className="px-2 py-1 rounded bg-red-800/40 border border-red-700 text-red-300">{presence.reason}</span>}
              <span className="px-2 py-1 rounded bg-gray-800/60 border border-gray-700">Devices: {devices.length}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 self-start lg:self-center">
            <Link href="/" className="px-5 py-2 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm flex items-center gap-2">&larr; Kembali</Link>
            <div className="flex gap-2 text-xs font-medium">
              <span className="px-3 py-2 rounded-md bg-yellow-500 text-black shadow shadow-yellow-500/30">Device Control</span>
              <Link href="/control/esp32-s2-mini/voice" className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200">Voice Control</Link>
              <Link href="/control/esp32-s2-mini/metrics" className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200">Broker Metrics</Link>
              <Link href="/control/esp32-s2-mini/monitor" className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200">Monitor</Link>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-10 items-start">
          {/* Left: Control Grid */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {devices.map(device => {
                const st = deviceStatuses[device.id];
                const pulse = animating[device.id];
                const warn = commandWarnings[device.id];
                const showConnMsg = !connected ? true : (st==='...');
                return (
                  <div key={device.id} className={`relative group rounded-xl border ${st==='ON' ? 'border-green-600/40' : st==='OFF' ? 'border-gray-700' : 'border-gray-700/60'} bg-gradient-to-br from-gray-900/70 to-gray-900/30 backdrop-blur p-5 flex flex-col gap-4 shadow-inner transition`}> 
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="font-semibold tracking-tight text-lg flex items-center gap-2">{device.name}{pulse && <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"/>}</h2>
                        <div className="mt-1 text-[11px] flex items-center gap-2 text-gray-400">Status: {statusChip(st)}</div>
                        {showConnMsg && (
                          <div className="mt-1 text-[10px] flex items-center gap-1 text-amber-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            {!connected ? (reconnecting ? 'Mencoba menyambung ke broker...' : 'Tidak terkoneksi ke broker') : 'Menunggu status perangkat...'}
                          </div>
                        )}
                        {warn && (
                          <div className="mt-1 text-[10px] px-2 py-1 rounded bg-red-500/15 border border-red-600/40 text-red-300 animate-fadeIn">
                            {warn.msg}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 text-[10px] text-gray-500 items-end">
                        <span className="uppercase tracking-wide">ID: {device.id}</span>
                        {st!=='...' && <span className={`font-medium ${st==='ON'?'text-green-400':'text-red-400'}`}>{st==='ON'?'Aktif':'Mati'}</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-gray-400 select-none">Kontrol</div>
                      <label className="relative inline-flex items-center cursor-pointer group/toggle">
                        {/* Accessible checkbox as toggle */}
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          aria-label={`Toggle ${device.name}`}
                          disabled={!client || !client.connected || presence.state!== 'online' || st==='...'}
                          checked={st==='ON'}
                          onChange={(e)=> handleControl(device.id, e.target.checked ? 'ON' : 'OFF')}
                        />
                        <div className={`relative w-14 h-8 rounded-full transition-all duration-300 border backdrop-blur
                          ${st==='ON' ? 'bg-green-600/70 border-green-500/60 shadow-[0_0_16px_rgba(34,197,94,0.35)]' : st==='OFF' ? 'bg-gray-700/70 border-gray-600' : 'bg-gray-800/60 border-gray-700'}
                          peer-disabled:opacity-40 peer-disabled:cursor-not-allowed`}
                        >
                          <div className={`absolute mt-1 ml-1 w-6 h-6 rounded-full transition-all duration-300
                            ${st==='ON' ? 'translate-x-6 bg-white shadow-[0_6px_16px_rgba(34,197,94,0.35)]' : 'translate-x-0 bg-gray-300'}
                          `} />
                        </div>
                        <span className="ml-3 text-[11px] font-semibold tracking-wide text-gray-300">
                          {st==='ON' ? 'ON' : st==='OFF' ? 'OFF' : '...'}
                        </span>
                      </label>
                    </div>
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Simulation Panel */}
          <aside className="relative rounded-2xl border border-gray-800 bg-gray-900/60 p-6 flex flex-col gap-6 shadow-xl shadow-black/40">
            <h3 className="text-sm font-semibold tracking-wide text-gray-200">Simulasi Perangkat</h3>
            <div className="grid grid-cols-2 gap-4">
              {devices.map(d => {
                const st = deviceStatuses[d.id];
                return (
                  <div key={d.id} className={`relative rounded-lg border ${st==='ON' ? 'border-green-500/50 bg-green-950/30' : 'border-gray-700 bg-gray-950/40'} p-3 flex flex-col items-center gap-2 transition`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-semibold shadow-inner ${st==='ON' ? 'bg-green-500/30 text-green-300 shadow-green-500/20' : 'bg-gray-700/40 text-gray-400'}`}>{st==='...' ? '?' : st}</div>
                    <p className="text-[10px] uppercase tracking-wide text-center text-gray-400 leading-tight">{d.name}</p>
                    {st!=='...' && <div className={`h-1 w-8 rounded-full ${st==='ON' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />}
                  </div>
                );
              })}
            </div>
            <div>
              <h4 className="text-[11px] font-semibold tracking-wide text-gray-300 mb-2">Riwayat Aksi</h4>
              <div className="h-48 overflow-auto rounded-lg border border-gray-800 bg-gray-950/40 text-[11px] divide-y divide-gray-800 custom-scroll">
                {history.slice().reverse().map(h => (
                  <div key={h.ts+''+h.id} className="px-3 py-2 flex items-center justify-between gap-4">
                    <span className="text-gray-400 font-mono">{new Date(h.ts).toLocaleTimeString()}</span>
                    <span className="flex-1 truncate text-gray-300">{prettyName(h.id)}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${h.action==='ON'?'bg-green-600/30 text-green-300':'bg-red-600/30 text-red-300'}`}>{h.action}</span>
                  </div>
                ))}
                {history.length===0 && <div className="p-4 text-[10px] text-gray-500">Belum ada aktivitas.</div>}
              </div>
            </div>
            <div className="text-[10px] text-gray-500 leading-relaxed">
              Panel simulasi ini hanya visual: tidak mengubah logika MQTT. Warna hijau menandakan kanal aktif (relay energize). History menampilkan aksi terbaru (maks 80 entri).
            </div>
          </aside>
        </div>
      </div>
    </main>
    </AuthGuard>
  );
}
