'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemberDetailModalProps {
  open: boolean;
  onClose: () => void;
  member: {
    name: string;
    roles: string[];
    longDetail: string[];
    workflow: string[];
    focus: string[];
    type: string;
  } | null;
}

export default function MemberDetailModal({ open, onClose, member }: MemberDetailModalProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const firstFocusable = useRef<HTMLButtonElement | null>(null);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Focus initial
  useEffect(() => {
    if (open && firstFocusable.current) firstFocusable.current.focus();
  }, [open]);

  // Click outside
  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <AnimatePresence>
      {open && member && (
        <motion.div
          ref={backdropRef}
          onMouseDown={onBackdropClick}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          aria-label={`Detail ${member.name}`}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 22 }}
            className="w-full max-w-3xl bg-gradient-to-b from-gray-900 via-gray-950 to-black border border-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-2">{member.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {member.roles.map(r => (
                    <span key={r} className="text-[10px] tracking-wide font-semibold uppercase bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300">{r}</span>
                  ))}
                </div>
              </div>
              <button ref={firstFocusable} onClick={onClose} className="text-gray-400 hover:text-yellow-400 transition text-sm border border-gray-700 hover:border-yellow-500 rounded px-2 py-1">Close</button>
            </div>
            <div className="px-6 pb-6 pt-4 overflow-y-auto custom-scroll space-y-10">
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-400 mb-3">Detail Pekerjaan</h3>
                <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                  {member.longDetail.map((p, i) => (<p key={i}>{p}</p>))}
                </div>
              </section>
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-400 mb-3">Alur / Workflow</h3>
                <ol className="list-decimal list-outside pl-5 space-y-2 text-gray-300 text-sm">
                  {member.workflow.map((w, i) => (
                    <li key={i} className="marker:text-yellow-400">{w}</li>
                  ))}
                </ol>
              </section>
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-400 mb-3">Fokus Teknis</h3>
                <div className="flex flex-wrap gap-2">
                  {member.focus.map(f => (
                    <span key={f} className="text-[10px] font-mono bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20">{f}</span>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
