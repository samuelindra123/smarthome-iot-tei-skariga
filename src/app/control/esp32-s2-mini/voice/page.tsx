"use client";

import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { PRESENCE_TOPIC, presenceFromPayload, PresenceModel, evaluateTimeout } from '@/lib/presence';
import { useMqtt } from '@/lib/mqtt';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives?: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  }
}

// Same broker URL used elsewhere
const MQTT_BROKER_URL: string = 'wss://mqtt.tecnoverse.app:8081';

type Command = 'ON' | 'OFF';
type LogEntry = { ts:number; text:string; type:'info'|'cmd'|'warn'|'err' };

const deviceAliases: Record<string, string[]> = {
  lampu1: ['lampu 1', 'lampu satu', 'lampu ruang tamu', 'lampu tamu', 'lampu depan dalam'],
  lampu2: ['lampu 2', 'lampu dua', 'lampu teras', 'lampu depan luar', 'lampu teras depan'],
  stopkontak1: ['stop kontak 1', 'stopkontak 1', 'stop kontak satu', 'stopkontak satu', 'colokan tv', 'stop kontak tv'],
  stopkontak2: ['stop kontak 2', 'stopkontak 2', 'stop kontak dua', 'stopkontak dua', 'colokan charger', 'charger pojok'],
};

const prettyName: Record<string, string> = {
  lampu1: 'Lampu Ruang Tamu',
  lampu2: 'Lampu Teras',
  stopkontak1: 'Stop Kontak TV',
  stopkontak2: 'Charger Pojok',
};

export default function VoiceControlPage() {
  const { client, connected, onMessage, publish: sharedPublish, subscribe } = useMqtt();
  const [presence, setPresence] = useState<PresenceModel>({ state: 'unknown', lastSeen: null, lastPayload: null, source: undefined });
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [volume, setVolume] = useState(0); // 0..1
  const audioSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasMedia = !!navigator.mediaDevices?.getUserMedia;
    const AC = window.AudioContext || window.webkitAudioContext;
    return hasMedia && !!AC;
  }, []);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // Periodic presence timeout evaluation (faster for real-time response)
  useEffect(() => {
    const id = setInterval(() => setPresence((p: PresenceModel) => evaluateTimeout(p)), 2000);
    return () => clearInterval(id);
  }, []);

  // MQTT setup - Real-time presence detection
  useEffect(() => {
    // Subscribe presence once client ready
    if (!client) return;
    subscribe(PRESENCE_TOPIC);
    const off = onMessage((topic, msg) => {
      if (topic === PRESENCE_TOPIC) {
        const payload = msg.toString();
        const meta = presenceFromPayload(payload);
        
        // INSTANT presence detection from MQTT - ONLY source of truth
        setPresence({
          state: meta.state,
          lastSeen: meta.state === 'online' ? Date.now() : null,
          lastPayload: payload,
          source: meta.source,
          reason: meta.state === 'offline' ? 'Device disconnected (MQTT LWT)' : undefined
        });
        
        setLogs((l: LogEntry[])=>[...l,{ts:Date.now(), text:`Presence: ${meta.state} (${meta.source})`, type:'info'}]);
      }
    });
    if (connected) {
      setLogs((l: LogEntry[])=>[...l,{ts:Date.now(), text:'Terhubung ke broker MQTT', type:'info'}]);
    }
    return () => off();
  }, [client, onMessage, subscribe, connected]);

  // Speech Recognition
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const canUseSpeech = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);
  const speechReady = mounted && canUseSpeech;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!canUseSpeech) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = true;
    if (recognition.maxAlternatives !== undefined) {
      recognition.maxAlternatives = 1;
    }
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(t);
          handleSpeechCommand(t);
        } else {
          interim += t;
          setTranscript(interim);
        }
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => setLogs((l: LogEntry[])=>[...l,{ts:Date.now(), text:`Speech error: ${e.error}`, type:'err'}]);
    recognitionRef.current = recognition;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUseSpeech]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      setListening(true);
      setTranscript('');
      // Start audio meter in parallel (best-effort)
      startAudioMeter().finally(() => {
        try { recognitionRef.current?.start(); } catch {}
      });
    }
    catch { setListening(false); }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    stopAudioMeter();
  };

  const toggleListening = () => {
    if (listening) stopListening(); else startListening();
  };

  const startAudioMeter = async () => {
    if (!audioSupported) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx: AudioContext = new AC();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      streamRef.current = stream;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteTimeDomainData(data);
        // Compute RMS from time-domain data
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128; // -1..1
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length); // 0..~1
        // Map and clamp for UI
        const mapped = Math.min(1, Math.max(0, (rms - 0.02) / 0.25));
        setVolume(mapped);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      // No animation if mic capture fails
      setVolume(0);
    }
  };

  const stopAudioMeter = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    streamRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    setVolume(0);
  };

  const publish = (deviceId: string, cmd: Command) => {
    const c = client;
    if (!c) {
      // Provider will buffer and flush on connect
      setLogs((l: LogEntry[])=>[...l,{ts:Date.now(), text:`Antri (init): ${cmd} -> ${deviceId}`, type:'cmd'}]);
      sharedPublish(`smarthome/${deviceId}/perintah`, cmd);
      return;
    }
    try {
      sharedPublish(`smarthome/${deviceId}/perintah`, cmd);
      setLogs((l: LogEntry[])=>[...l,{ts:Date.now(), text:`${c.connected ? 'Kirim' : 'Antri (offline)'}: ${cmd} -> ${deviceId}`, type:'cmd'}]);
    } catch (e:unknown) {
      const err = e as { message?: string };
      setLogs((l: LogEntry[])=>[...l,{ts:Date.now(), text:`Gagal publish: ${err?.message || String(e)}`, type:'err'}]);
    }
  };

  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}+/gu,'');

  const resolveDevice = (speech: string): string | null => {
    const n = normalize(speech);
    for (const id of Object.keys(deviceAliases)) {
      for (const alias of deviceAliases[id]) {
        if (n.includes(normalize(alias))) return id;
      }
    }
    // fallback simple patterns
    const hasLampu = /\blampu\b/.test(n);
    const hasStop = /\bstop ?kontak\b|\bstopkontak\b|\bcolokan\b/.test(n);
    const num2 = /\b(dua|2)\b/.test(n);
    const num1 = /\b(satu|1)\b/.test(n);
    if (hasLampu || hasStop) {
      if (num2) return hasLampu ? 'lampu2' : 'stopkontak2';
      if (num1) return hasLampu ? 'lampu1' : 'stopkontak1';
    }
    return null;
  };

  const parseCommand = (speech: string): { deviceId: string|null; cmd: Command|null } => {
    const n = normalize(speech);
    // Use word boundaries to avoid matching 'on' inside 'kontak'
    const ON_RE = /\b(nyalakan|nyala|hidup(?:kan)?|aktif(?:kan)?|on)\b/;
    const OFF_RE = /\b(matikan|mati|nonaktif(?:kan)?|padam|off)\b/;
    const idxOn = n.search(ON_RE);
    const idxOff = n.search(OFF_RE);

    let cmd: Command | null = null;
    if (idxOn !== -1 && idxOff !== -1) {
      // If both present, prefer the one that appears first in the phrase
      cmd = idxOff <= idxOn ? 'OFF' : 'ON';
    } else if (idxOff !== -1) {
      cmd = 'OFF';
    } else if (idxOn !== -1) {
      cmd = 'ON';
    }

    const deviceId = resolveDevice(n);
    return { deviceId, cmd };
  };

  const handleSpeechCommand = useCallback((speech: string) => {
    const { deviceId, cmd } = parseCommand(speech);
    if (!cmd) { setLogs((l: LogEntry[])=>[...l,{ts:Date.now(), text:`Tidak mengenali perintah dari: &ldquo;${speech}&rdquo;`, type:'warn'}]); return; }
    if (!deviceId) { setLogs((l: LogEntry[])=>[...l,{ts:Date.now(), text:`Perangkat tidak dikenali dari: &ldquo;${speech}&rdquo;`, type:'warn'}]); return; }
    publish(deviceId, cmd);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, sharedPublish]);

  const presenceBadge = () => {
    if (presence.state==='offline') return <span className="px-2 py-1 rounded bg-red-600/30 text-red-200 text-[10px] border border-red-500/50">Device Offline</span>;
    if (presence.state==='unknown') return <span className="px-2 py-1 rounded bg-gray-600/30 text-gray-200 text-[10px] border border-gray-500/50">Presence Unknown</span>;
    return <span className="px-2 py-1 rounded bg-green-600/30 text-green-200 text-[10px] border border-green-500/50">Device Online</span>;
  };

  return (
    <AuthGuard>
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white px-4 md:px-8 py-14">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex flex-col lg:flex-row lg:items-end gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Voice Control</h1>
              {/* Real-time broker status */}
              {!connected ? (
                <span className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-[10px] border border-red-600/40 animate-pulse">Broker Disconnected</span>
              ) : (
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-[10px] border border-green-600/40">Broker Connected</span>
              )}
              {/* Real-time device presence */}
              {presenceBadge()}
            </div>
            <p className="text-sm md:text-base text-gray-400 max-w-2xl leading-relaxed">Kontrol perangkat dengan perintah suara bahasa Indonesia. Contoh: &ldquo;Nyalakan lampu teras&rdquo;, &ldquo;Matikan stop kontak TV&rdquo;.</p>
            <div className="flex flex-wrap gap-3 text-[11px] text-gray-300">
              <span className="px-2 py-1 rounded bg-gray-800/60 border border-gray-700">Broker: {connected ? '✓ Connected' : '✗ Disconnected'}</span>
              <span className={`px-2 py-1 rounded border ${presence.state === 'online' ? 'bg-green-800/40 border-green-700 text-green-300' : presence.state === 'offline' ? 'bg-red-800/40 border-red-700 text-red-300' : 'bg-gray-800/60 border-gray-700'}`}>
                Device: {presence.state.toUpperCase()}
              </span>
              {presence.source && <span className="px-2 py-1 rounded bg-gray-800/60 border border-gray-700">Source: {presence.source}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-3 self-start lg:self-center">
            <Link href="/" className="px-5 py-2 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm flex items-center gap-2">&larr; Kembali</Link>
            <div className="flex gap-2 text-xs font-medium">
              <Link href="/control/esp32-s2-mini" className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200">Device Control</Link>
              <span className="px-3 py-2 rounded-md bg-yellow-500 text-black shadow shadow-yellow-500/30">Voice Control</span>
              <Link href="/control/esp32-s2-mini/metrics" className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200">Broker Metrics</Link>
              <Link href="/control/esp32-s2-mini/monitor" className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200">Monitor</Link>
            </div>
          </div>
        </header>

        <section className="grid md:grid-cols-2 gap-8 items-start">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 space-y-6 shadow-xl shadow-black/40">
            <h3 className="text-sm font-semibold tracking-wide text-gray-200">Perintah Suara</h3>
            <div className="relative flex items-center justify-center py-6">
              {/* Animated rings */}
              <div
                aria-hidden
                className="absolute rounded-full border border-emerald-500/30"
                style={{ width: 180, height: 180, transform: `scale(${1 + volume * 0.5})`, opacity: 0.25 + volume * 0.4, transition: 'transform 80ms linear, opacity 120ms linear' }}
              />
              <div
                aria-hidden
                className="absolute rounded-full border border-emerald-400/20"
                style={{ width: 240, height: 240, transform: `scale(${1 + volume * 0.8})`, opacity: 0.15 + volume * 0.3, transition: 'transform 80ms linear, opacity 120ms linear' }}
              />
              {/* Mic button */}
              <button
                onClick={toggleListening}
                aria-pressed={listening}
                aria-label={listening ? 'Berhenti mendengarkan' : 'Mulai mendengarkan'}
                disabled={!speechReady}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center select-none border transition-all
                  ${listening ? 'bg-emerald-600/90 border-emerald-400 shadow-[0_0_32px_rgba(16,185,129,0.45)]' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}
                  disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {/* Mic SVG */}
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow">
                  <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" fill="currentColor" className={`${listening ? 'text-white' : 'text-gray-300'}`}/>
                  <path d="M5 11a1 1 0 1 0-2 0 9 9 0 0 0 8 8v2H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2a9 9 0 0 0 8-8 1 1 0 1 0-2 0 7 7 0 1 1-14 0Z" fill="currentColor" className={`${listening ? 'text-white/90' : 'text-gray-400'}`}/>
                </svg>
                {/* Small live indicator */}
                <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${listening ? 'bg-red-400 animate-pulse' : 'bg-transparent'}`} />
              </button>
            </div>
            <div className="text-center text-sm">
              {!mounted && (
                <span className="font-medium text-gray-300">Menyiapkan mikrofon...</span>
              )}
              {mounted && (
                canUseSpeech ? (
                  <span className={`font-medium ${listening ? 'text-emerald-300' : 'text-gray-300'}`}>
                    {listening ? 'Mendengarkan...' : 'Ketuk tombol mikrofon untuk mulai'}
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-300">Browser tidak mendukung Web Speech API</span>
                )
              )}
            </div>
            <div className="h-24 rounded-md border border-gray-800 bg-black/30 p-3 text-sm text-gray-300 font-mono">
              {transcript || 'Ucapkan perintah...'}
            </div>
            <div className="text-[11px] text-gray-400">
              Contoh frasa: &ldquo;nyalakan lampu ruang tamu&rdquo;, &ldquo;matikan lampu teras&rdquo;, &ldquo;hidupkan stop kontak tv&rdquo;.
            </div>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 space-y-4 shadow-xl shadow-black/40">
            <h3 className="text-sm font-semibold tracking-wide text-gray-200">Log</h3>
            <div className="h-64 overflow-auto rounded-lg border border-gray-800 bg-gray-950/40 text-[11px] divide-y divide-gray-800 custom-scroll">
              {logs.slice().reverse().map((l, idx) => (
                <div key={l.ts+''+idx} className="px-3 py-2 flex items-center justify-between gap-4">
                  <span className="text-gray-500 font-mono">{new Date(l.ts).toLocaleTimeString()}</span>
                  <span className={`${l.type==='cmd'?'text-emerald-300': l.type==='err'?'text-red-300': l.type==='warn'?'text-amber-300':'text-gray-300'} flex-1`}>{l.text}</span>
                </div>
              ))}
              {logs.length===0 && <div className="p-4 text-[10px] text-gray-500">Belum ada log.</div>}
            </div>
            <div className="text-[10px] text-gray-500 leading-relaxed">
              Privasi: pengenalan suara diproses oleh engine browser. Pastikan izin mikrofon diizinkan untuk situs ini.
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 space-y-4 shadow-xl shadow-black/40">
          <h3 className="text-sm font-semibold tracking-wide text-gray-200">Alias Perangkat</h3>
          <ul className="grid md:grid-cols-2 gap-3 text-[12px] text-gray-300 list-disc pl-6">
            {Object.entries(deviceAliases).map(([id, aliases]) => (
              <li key={id}><span className="text-gray-400">{prettyName[id]}:</span> {aliases.join(', ')}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
    </AuthGuard>
  );
}
