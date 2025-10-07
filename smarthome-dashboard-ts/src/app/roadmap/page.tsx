'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'done' | 'in-progress' | 'planned';
  children?: RoadmapItem[];
  quarter?: string;
}

interface FlowStep {
  id: string;
  title: string;
  description: string;
  order: number;
}

const flowSteps: FlowStep[] = [
  { id: 'flow-open', title: 'Buka Dashboard', description: 'Browser memuat Next.js & inisialisasi klien MQTT.', order: 1 },
  { id: 'flow-connect', title: 'Koneksi Broker', description: 'Handshake WebSocket → sesi siap.', order: 2 },
  { id: 'flow-sub', title: 'Subscribe Status', description: 'smarthome/+/status untuk semua perangkat.', order: 3 },
  { id: 'flow-render', title: 'Render Status', description: 'State global diperbarui & UI sinkron.', order: 4 },
  { id: 'flow-command', title: 'Kirim Perintah', description: 'UI publish ON/OFF: smarthome/<id>/perintah.', order: 5 },
  { id: 'flow-fw', title: 'Firmware Eksekusi', description: 'ESP32 aktifkan relay & publish status baru.', order: 6 },
  { id: 'flow-loop', title: 'Loop Realtime', description: 'Siklus berulang menjaga konsistensi.', order: 7 }
];

const roadmap: RoadmapItem[] = [
  {
    id: 'foundation',
    title: 'Fondasi Sistem',
    description: 'Inisialisasi proyek, struktur Next.js, koneksi MQTT dasar, & kontrol relay dasar.',
    status: 'done',
    quarter: 'Q1',
    children: [
      { id: 'init-next', title: 'Setup Next.js + TypeScript', description: 'Struktur app dir, konfigurasi font, Tailwind.', status: 'done' },
      { id: 'mqtt-basic', title: 'Koneksi MQTT WebSocket', description: 'Client mqtt.js & subscribe status perangkat.', status: 'done' },
      { id: 'relay-mapping', title: 'Mapping Relay 4CH', description: 'Topik perintah & status tiap channel distandarkan.', status: 'done' },
      { id: 'ui-control', title: 'UI Control Panel V1', description: 'Device card ON/OFF & indikator status.', status: 'done' }
    ]
  },
  {
    id: 'improvement',
    title: 'Peningkatan Stabilitas',
    description: 'Optimasi UX, penanganan reconnect, dokumentasi wiring rapi.',
    status: 'in-progress',
    quarter: 'Q2',
    children: [
      { id: 'reconnect-strategy', title: 'Strategi Reconnect', description: 'Log status koneksi & fallback UI.', status: 'in-progress' },
      { id: 'wiring-doc', title: 'Dokumentasi Wiring', description: 'Panel diagram + label channel.', status: 'planned' },
      { id: 'status-badge', title: 'Global Status Badge', description: 'Indikator koneksi MQTT di header.', status: 'planned' }
    ]
  },
  {
    id: 'advanced',
    title: 'Optimasi & AI',
    description: 'Prediksi pola penggunaan & rekomendasi hemat energi.',
    status: 'planned',
    quarter: 'Q4',
    children: [
      { id: 'pattern-learning', title: 'Deteksi Pola Penggunaan', description: 'Analisis historis ON/OFF.', status: 'planned' },
      { id: 'ai-recommend', title: 'AI Rekomendasi', description: 'Saran otomatis hemat energi.', status: 'planned' },
      { id: 'anomaly-detect', title: 'Deteksi Anomali', description: 'Notifikasi bila perilaku abnormal.', status: 'planned' }
    ]
  }
];

const statusStyles: Record<RoadmapItem['status'], string> = {
  done: 'bg-green-500/20 text-green-300 border-green-500/40',
  'in-progress': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 animate-pulse-slow',
  planned: 'bg-gray-500/20 text-gray-300 border-gray-500/40'
};

export default function RoadmapPage() {
  // Pan & zoom state for graph canvas
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const isDragging = useRef(false);
  const lastPos = useRef<{x:number;y:number}>({x:0,y:0});
  const containerRef = useRef<HTMLDivElement|null>(null);

  const clampScale = (s:number) => Math.min(2.2, Math.max(0.4, s));

  const onWheel = useCallback((e:WheelEvent) => {
    if (!containerRef.current) return;
    // zoom towards cursor
    const rect = containerRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    setScale(prev => {
      const next = clampScale(prev + delta);
      // adjust translate to keep cursor position stable
      const ratio = next / prev - 1;
      setTx(t => t - cx * ratio);
      setTy(t => t - cy * ratio);
      return next;
    });
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTx(t => t + dx);
    setTy(t => t + dy);
  };

  const endDrag = () => { isDragging.current = false; };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => onWheel(e);
    el.addEventListener('wheel', handler, { passive: false });
    return () => { el.removeEventListener('wheel', handler); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetView = () => { setScale(1); setTx(0); setTy(0); };
  const zoomIn = () => setScale(s => clampScale(s + 0.18));
  const zoomOut = () => setScale(s => clampScale(s - 0.18));

  // Status filters
  const [showDone, setShowDone] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showPlanned, setShowPlanned] = useState(true);

  const statusVisible = (s: RoadmapItem['status']) =>
    (s === 'done' && showDone) || (s === 'in-progress' && showProgress) || (s === 'planned' && showPlanned);

  const [compact, setCompact] = useState(false);
  const graphInnerRef = useRef<HTMLDivElement|null>(null);
  const [lines, setLines] = useState<Array<{x1:number;y1:number;x2:number;y2:number;id:string}>>([]);
  const [tooltip, setTooltip] = useState<{x:number;y:number;content:string;visible:boolean}>({x:0,y:0,content:'',visible:false});

  const showTooltip = (e: React.MouseEvent, content: string) => {
    setTooltip({ x: e.clientX + 12, y: e.clientY + 12, content, visible: true });
  };
  const moveTooltip = (e: React.MouseEvent) => {
    setTooltip(t => ({ ...t, x: e.clientX + 12, y: e.clientY + 12 }));
  };
  const hideTooltip = () => setTooltip(t => ({ ...t, visible: false }));

  // Export & Print
  const exportJSON = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      filters: { showDone, showProgress, showPlanned },
      compact,
      roadmap,
      flow: flowSteps
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roadmap-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const printView = () => { window.print(); };

  // Compute roadmap connector lines based on measured DOM positions after layout.
  // We store only simple line segments (parent center bottom -> child center top) for clarity.
  const computeLines = useCallback(() => {
    const root = graphInnerRef.current;
    if (!root) return;
    const parentRect = root.getBoundingClientRect();
    const getRect = (id:string) => {
      const el = root.querySelector(`[data-node-id="${id}"]`) as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { r, centerX: r.left - parentRect.left + r.width/2, top: r.top - parentRect.top, bottom: r.top - parentRect.top + r.height };
    };
    const foundationRect = getRect('foundation');
    if (!foundationRect) return;
    const next: Array<{x1:number;y1:number;x2:number;y2:number;id:string}> = [];
    // lines to foundation children
    roadmap[0].children?.forEach(ch => {
      if (!statusVisible(ch.status)) return;
      const childRect = getRect(ch.id);
      if (!childRect) return;
      next.push({
        id: `f-${ch.id}`,
        x1: foundationRect.centerX,
        y1: foundationRect.bottom,
        x2: childRect.centerX,
        y2: childRect.top,
      });
    });
    // lines from foundation to other main phases
    roadmap.slice(1).forEach(phase => {
      if (!statusVisible(phase.status)) return;
      const phaseRect = getRect(phase.id);
      if (!phaseRect) return;
      next.push({
        id: `f-${phase.id}`,
        x1: foundationRect.centerX,
        y1: foundationRect.bottom,
        x2: phaseRect.centerX,
        y2: phaseRect.top,
      });
    });
    setLines(next);
  }, [showDone, showPlanned, showProgress, compact, statusVisible]);

  useEffect(() => {
    // Recompute after layout when transforms or filters change.
    const t = setTimeout(computeLines, 30);
    return () => clearTimeout(t);
  }, [computeLines, scale, tx, ty]);

  useEffect(() => {
    const onResize = () => computeLines();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [computeLines]);

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white px-6 py-24 select-none">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Project Roadmap</h1>
            <p className="text-gray-300 leading-relaxed max-w-2xl text-sm md:text-base">Alur rencana kerja dari fondasi sampai ekspansi lanjutan. Gaya tampilan terinspirasi struktur roadmap hierarkis (seperti roadmap.sh) dengan status real-time.</p>
          </div>
          <div className="flex flex-col gap-3 self-start md:self-center">
            <Link href="/control/esp32-s2-mini" className="px-6 py-3 rounded-md bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-lg shadow-yellow-500/30 text-sm transition">→ Control Panel</Link>
            <Link href="/team" className="px-6 py-3 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold border border-gray-700 text-sm transition">← Tim</Link>
          </div>
        </header>

        {/* Controls */}
        <div className="hide-print flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-800/60 border border-gray-700 rounded-md p-1" role="group" aria-label="Zoom controls">
            <button onClick={zoomOut} aria-label="Zoom out" className="px-2 py-1 text-xs rounded bg-gray-900/60 hover:bg-gray-700">-</button>
            <button onClick={resetView} aria-label="Reset view" className="px-2 py-1 text-xs rounded bg-gray-900/60 hover:bg-gray-700">Reset</button>
            <button onClick={zoomIn} aria-label="Zoom in" className="px-2 py-1 text-xs rounded bg-gray-900/60 hover:bg-gray-700">+</button>
          </div>
          <button
            onClick={() => setCompact(c=>!c)}
            aria-pressed={compact}
            aria-label="Toggle compact mode"
            className={`px-3 py-1 text-xs rounded border ${compact ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-gray-800/60 border-gray-700 text-gray-300'} hover:bg-gray-700`}
          >{compact ? 'Detail Mode' : 'Compact Mode'}</button>
          <div className="flex items-center gap-1 bg-gray-800/60 border border-gray-700 rounded-md p-1" role="group" aria-label="Export & print">
            <button onClick={exportJSON} aria-label="Export JSON" className="px-2 py-1 text-[10px] rounded bg-gray-900/60 hover:bg-gray-700">Export</button>
            <button onClick={printView} aria-label="Print view" className="px-2 py-1 text-[10px] rounded bg-gray-900/60 hover:bg-gray-700">Print</button>
          </div>
          <div className="flex items-center gap-2 text-[10px] bg-gray-800/60 border border-gray-700 rounded-md px-2 py-1" role="group" aria-label="Status filters">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={showDone} onChange={e=>setShowDone(e.target.checked)} className="accent-green-500" />
              <span className="text-green-400">Done</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={showProgress} onChange={e=>setShowProgress(e.target.checked)} className="accent-yellow-400" />
              <span className="text-yellow-400">Progress</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={showPlanned} onChange={e=>setShowPlanned(e.target.checked)} className="accent-gray-400" />
              <span className="text-gray-300">Planned</span>
            </label>
          </div>
          <span className="text-[10px] text-gray-400">Drag untuk pan • Scroll untuk zoom • {Math.round(scale*100)}%</span>
        </div>

        <section className="mb-24">
          <h2 className="text-2xl font-semibold mb-10 tracking-tight text-yellow-400">Tahapan Utama (Graph)</h2>
          <div
            ref={containerRef}
            className="relative overflow-hidden pb-10 rounded-lg border border-gray-800 bg-gray-950/40 dotted-bg graph-canvas"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseLeave={endDrag}
            onMouseUp={endDrag}
          >
            <div
              ref={graphInnerRef}
              className="min-w-[900px] mx-auto flex flex-col gap-20 transition-transform will-change-transform relative"
              style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: '0 0' }}
            >
              {/* SVG connectors (auto scales with content) dotted lines between nodes */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" aria-hidden="true">
                <defs>
                  <marker id="dot" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                    <circle cx="2" cy="2" r="2" fill="#555" />
                  </marker>
                </defs>
                {lines.map(l => (
                  <line
                    key={l.id}
                    x1={l.x1}
                    y1={l.y1}
                    x2={l.x2}
                    y2={l.y2}
                    stroke="#555"
                    strokeWidth={1.2}
                    strokeDasharray="4 6"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
              {/* Layer 1 */}
              <div className="flex justify-center">
                {statusVisible(roadmap[0].status) && <RoadmapNode item={roadmap[0]} level={0} compact={compact} onShowTooltip={showTooltip} onMoveTooltip={moveTooltip} onHideTooltip={hideTooltip} />}
              </div>
              {/* Layer 2 children of foundation */}
              <Connector className="top-[120px]" />
              <div className="flex flex-wrap justify-center gap-6">
                {roadmap[0].children?.filter(c => statusVisible(c.status)).map(c => (
                  <RoadmapChild key={c.id} item={c} compact={compact} onShowTooltip={showTooltip} onMoveTooltip={moveTooltip} onHideTooltip={hideTooltip} />
                ))}
              </div>
              {/* Layer 3 major phases beyond foundation */}
              <div className="flex flex-col md:flex-row items-stretch justify-center gap-16">
                {roadmap.slice(1).filter(p => statusVisible(p.status)).map(phase => (
                  <div key={phase.id} className="flex flex-col items-center gap-8">
                    <RoadmapNode item={phase} level={1} compact={compact} onShowTooltip={showTooltip} onMoveTooltip={moveTooltip} onHideTooltip={hideTooltip} />
                    <div className="flex flex-col gap-3">
                      {phase.children?.filter(ch => statusVisible(ch.status)).map(ch => (
                        <RoadmapMini key={ch.id} item={ch} compact={compact} onShowTooltip={showTooltip} onMoveTooltip={moveTooltip} onHideTooltip={hideTooltip} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Layout bergaya graf (simplified) meniru style roadmap topik, mengelompokkan fase utama dan subtugas.</p>
          {tooltip.visible && (
            <div
              className="fixed z-50 max-w-xs px-3 py-2 rounded-md bg-gray-900/90 border border-gray-700 text-[10px] text-gray-200 tooltip-shadow"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              {tooltip.content}
            </div>
          )}
        </section>

        <section className="mb-24">
          <h2 className="text-2xl font-semibold mb-8 tracking-tight text-yellow-400">Alur Kerja Sistem (Flow)</h2>
          <FlowGraph />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 tracking-tight text-yellow-400">Keterangan Status</h2>
          <div className="grid gap-6 sm:grid-cols-3 text-xs">
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
              <p className="font-semibold text-green-400 mb-1">Done</p>
              <p className="text-gray-400 leading-relaxed">Fitur / tugas telah selesai dan stabil.</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
              <p className="font-semibold text-yellow-400 mb-1">In Progress</p>
              <p className="text-gray-400 leading-relaxed">Sedang aktif dikerjakan / diuji.</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
              <p className="font-semibold text-gray-300 mb-1">Planned</p>
              <p className="text-gray-400 leading-relaxed">Masuk daftar rencana berikutnya.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Removed unused SimpleItem interface (was triggering eslint no-unused-vars)

function statusDot(status: RoadmapItem['status']) {
  return status === 'done' ? 'bg-green-400' : status === 'in-progress' ? 'bg-yellow-400 animate-pulse-slow' : 'bg-gray-600';
}

interface Tooltipable { onShowTooltip?: (e: React.MouseEvent, content: string)=>void; onMoveTooltip?: (e: React.MouseEvent)=>void; onHideTooltip?: ()=>void; }

function RoadmapNode({ item, level, compact, onShowTooltip, onMoveTooltip, onHideTooltip }: { item: RoadmapItem; level: number; compact?: boolean } & Tooltipable) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      data-node-id={item.id}
      className={`relative ${compact ? 'px-4 py-3' : 'px-5 py-4'} rounded-xl border ${item.status === 'done' ? 'border-green-600/40' : item.status === 'in-progress' ? 'border-yellow-600/40' : 'border-gray-700'} bg-gray-900/70 backdrop-blur flex flex-col min-w-[200px] max-w-[260px]`}
  onMouseEnter={(e: React.MouseEvent) => { if (compact && onShowTooltip) onShowTooltip(e, item.description); }}
  onMouseMove={(e: React.MouseEvent) => { if (compact && onMoveTooltip) onMoveTooltip(e); }}
      onMouseLeave={() => { if (onHideTooltip) onHideTooltip(); }}
    >
      <div className={`absolute -top-2 -left-2 w-4 h-4 rounded-full border-2 border-gray-800 ${statusDot(item.status)}`} />
      <h3 className={`font-semibold ${compact ? 'text-[11px]' : 'text-sm'} tracking-tight ${compact ? 'mb-0.5' : 'mb-1'}`}>{item.title}</h3>
      {!compact && <p className="text-[11px] leading-relaxed text-gray-400 mb-3 line-clamp-5">{item.description}</p>}
      <div className="flex items-center gap-2 mt-auto">
        {item.quarter && <span className="text-[9px] uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-300">{item.quarter}</span>}
        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${statusStyles[item.status]}`}>{item.status.replace('-', ' ')}</span>
      </div>
    </motion.div>
  );
}

function RoadmapChild({ item, compact, onShowTooltip, onMoveTooltip, onHideTooltip }: { item: RoadmapItem; compact?: boolean } & Tooltipable) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      data-node-id={item.id}
      className={`relative ${compact ? 'px-3 py-2.5' : 'px-4 py-3'} rounded-lg border ${item.status === 'done' ? 'border-green-600/40' : item.status === 'in-progress' ? 'border-yellow-600/40' : 'border-gray-700'} bg-gray-900/60 min-w-[170px]`}
  onMouseEnter={(e: React.MouseEvent) => { if (compact && onShowTooltip) onShowTooltip(e, item.description); }}
  onMouseMove={(e: React.MouseEvent) => { if (compact && onMoveTooltip) onMoveTooltip(e); }}
      onMouseLeave={() => { if (onHideTooltip) onHideTooltip(); }}
    >
      <div className={`absolute -top-2 -left-2 w-3.5 h-3.5 rounded-full border-2 border-gray-800 ${statusDot(item.status)}`} />
      <p className={`font-semibold text-gray-200 ${compact ? 'text-[10px] mb-0.5' : 'text-[11px] mb-1'}`}>{item.title}</p>
      {!compact && <p className="text-[10px] text-gray-400 leading-snug line-clamp-4">{item.description}</p>}
      <span className={`mt-${compact ? '1' : '2'} inline-block text-[9px] uppercase px-1 py-0.5 rounded border ${statusStyles[item.status]}`}>{item.status}</span>
    </motion.div>
  );
}

function RoadmapMini({ item, compact, onShowTooltip, onMoveTooltip, onHideTooltip }: { item: RoadmapItem; compact?: boolean } & Tooltipable) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      data-node-id={item.id}
      className={`relative ${compact ? 'px-2.5 py-1.5' : 'px-3 py-2'} rounded-md border text-left ${item.status === 'done' ? 'border-green-600/40' : item.status === 'in-progress' ? 'border-yellow-600/40' : 'border-gray-700'} bg-gray-900/50 min-w-[150px]`}
  onMouseEnter={(e: React.MouseEvent) => { if (compact && onShowTooltip) onShowTooltip(e, item.description); }}
  onMouseMove={(e: React.MouseEvent) => { if (compact && onMoveTooltip) onMoveTooltip(e); }}
      onMouseLeave={() => { if (onHideTooltip) onHideTooltip(); }}
    >
      <div className={`absolute -top-2 -left-2 w-3 h-3 rounded-full border-2 border-gray-800 ${statusDot(item.status)}`} />
      <p className={`font-semibold text-gray-200 ${compact ? 'text-[9px] mb-0' : 'text-[10px] mb-0.5'}`}>{item.title}</p>
      {!compact && <p className="text-[9px] text-gray-400 leading-snug line-clamp-3">{item.description}</p>}
      <span className={`mt-${compact ? '0.5' : '1'} inline-block text-[8px] uppercase px-1 py-0.5 rounded border ${statusStyles[item.status]}`}>{item.status}</span>
    </motion.div>
  );
}

function Connector({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className || ''}`}>{/* decorative only */}</div>
  );
}

// Flow Graph component (linear sequence with connectors similar style)
function FlowGraph() {
  const containerRef = useRef<HTMLDivElement|null>(null);
  const innerRef = useRef<HTMLDivElement|null>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [lines, setLines] = useState<Array<{x1:number;y1:number;x2:number;y2:number;id:string}>>([]);
  const dragging = useRef(false);
  const last = useRef({x:0,y:0});

  const clamp = (s:number) => Math.min(2.2, Math.max(.5, s));
  const onWheel = (e:WheelEvent) => {
    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left; const cy = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    setScale(prev => {
      const next = clamp(prev + delta);
      const ratio = next / prev - 1;
      setTx(t => t - cx * ratio);
      setTy(t => t - cy * ratio);
      return next;
    });
  };
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const handler = (e: WheelEvent) => onWheel(e);
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const compute = () => {
    const root = innerRef.current; if (!root) return;
    const parentRect = root.getBoundingClientRect();
    const getRect = (id:string) => {
      const el = root.querySelector(`[data-flow-id="${id}"]`) as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { centerX: r.left - parentRect.left + r.width/2, top: r.top - parentRect.top, bottom: r.top - parentRect.top + r.height };
    };
    const arr: Array<{x1:number;y1:number;x2:number;y2:number;id:string}> = [];
    for (let i=0;i<flowSteps.length-1;i++) {
      const a = getRect(flowSteps[i].id); const b = getRect(flowSteps[i+1].id); if (!a||!b) continue;
      arr.push({ id: `${flowSteps[i].id}-${flowSteps[i+1].id}`, x1: a.centerX, y1: a.bottom, x2: b.centerX, y2: b.top });
    }
    setLines(arr);
  };
  useEffect(() => { const t = setTimeout(compute, 30); return () => clearTimeout(t); }, [scale, tx, ty]);
  useEffect(() => { window.addEventListener('resize', compute); return () => window.removeEventListener('resize', compute); }, []);

  const onMouseDown = (e: React.MouseEvent) => { dragging.current = true; last.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = (e: React.MouseEvent) => { if (!dragging.current) return; const dx = e.clientX - last.current.x; const dy = e.clientY - last.current.y; last.current = { x: e.clientX, y: e.clientY }; setTx(t=>t+dx); setTy(t=>t+dy); };
  const end = () => { dragging.current = false; };
  const reset = () => { setScale(1); setTx(0); setTy(0); };

  return (
    <div className="space-y-3">
      <div className="hide-print flex items-center gap-2 text-[10px]">
        <div className="flex items-center gap-1 bg-gray-800/60 border border-gray-700 rounded-md p-1">
          <button onClick={()=>setScale(s=>clamp(s-0.18))} className="px-2 py-1 rounded bg-gray-900/60 hover:bg-gray-700">-</button>
          <button onClick={reset} className="px-2 py-1 rounded bg-gray-900/60 hover:bg-gray-700">Reset</button>
          <button onClick={()=>setScale(s=>clamp(s+0.18))} className="px-2 py-1 rounded bg-gray-900/60 hover:bg-gray-700">+</button>
        </div>
        <span className="text-gray-500">Flow Graph • Drag / Scroll • {Math.round(scale*100)}%</span>
      </div>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-gray-800 bg-gray-950/40 dotted-bg graph-canvas"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={end}
        onMouseUp={end}
      >
        <div
          ref={innerRef}
          className="min-w-[900px] mx-auto flex flex-col gap-16 py-12 transition-transform will-change-transform relative"
          style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: '0 0' }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" aria-hidden="true">
            {lines.map(l => (
              <line key={l.id} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#555" strokeWidth={1.1} strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
          {flowSteps.map(step => (
            <motion.div
              key={step.id}
              data-flow-id={step.id}
              initial={{ opacity:0, y: 24 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, amount:0.4 }}
              transition={{ duration:0.45, ease: 'easeOut' }}
              className="relative px-5 py-4 rounded-lg border border-gray-700 bg-gray-900/70 backdrop-blur mx-auto w-[320px]"
            >
              <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full border-2 border-gray-800 bg-yellow-400" />
              <p className="text-sm font-semibold text-gray-200 mb-1">{step.order}. {step.title}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
