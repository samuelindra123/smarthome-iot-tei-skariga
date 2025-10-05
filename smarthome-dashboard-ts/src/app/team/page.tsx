'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import MemberDetailModal from '@/components/MemberDetailModal';

// Jika framer-motion belum terpasang, jalankan: npm install framer-motion
// Halaman tim dengan animasi ringan & layout elegan.

interface Member {
  name: string;            // Nama lengkap
  roles: string[];         // Multi-role badge
  detail: string;          // Ringkas (kartu)
  longDetail: string[];    // Paragraf detail panjang
  workflow: string[];      // Step / alur pekerjaan
  focus: string[];         // Fokus / keahlian khusus (badge kecil)
  type: 'hardware' | 'software';
}

const members: Member[] = [
  {
    name: 'Samuel Indra Bastian',
    roles: ['Lead Developer', 'IoT Engineer', 'MQTT Broker Ops'],
    detail: 'Firmware ESP32-S2 Mini, arsitektur topik MQTT, implementasi dashboard Next.js, & konfigurasi broker VPS.',
    longDetail: [
      'Samuel memimpin perancangan sistem end-to-end: desain struktur topik MQTT yang hemat trafik, pemetaan relay ke channel logis, pola penamaan konsisten, dan strategi ekspansi modul agar sistem mudah diskalakan & dipahami anggota baru.',
      'Pada sisi firmware dan infrastruktur: membangun loop non-blocking (reconnect & debouncing), mekanisme publikasi status idempoten, konfigurasi broker MQTT di VPS Windows Server 2022 (service auto-restart, port WebSocket terpisah, segmentasi topik dasar & kredensial sederhana).',
      'Untuk lapisan aplikasi: implementasi dashboard Next.js berbasis mqtt.js dengan state reaktif per device, pemisahan komponen modular, uji skenario (disconnect, latency, stress toggle), serta dokumentasi internal untuk perencanaan fitur lanjutan.'
    ],
    workflow: [
      'Merancang struktur topik: smarthome/<deviceId>/{status|perintah}',
      'Menulis firmware dasar koneksi Wi-Fi & MQTT (boot + reconnect)',
      'Implementasi handler pesan perintah & pemetaan relay digital output',
      'Publikasi status periodik + on-change (optimasi pengurangan noise)',
      'Setup broker MQTT (service, port, WebSocket) di VPS',
      'Membangun dashboard Next.js + integrasi mqtt.js client',
      'Uji integrasi end-to-end & logging debug',
      'Optimasi UX (komponen device card, status realtime)',
      'Dokumentasi internal & rencana fitur lanjutan'
    ],
    focus: ['Firmware', 'Realtime Logic', 'Broker Config', 'System Design'],
    type: 'software'
  },
  {
    name: 'Marvel Edrea Putera',
    roles: ['Hardware Wiring', 'Panel Builder'],
    detail: 'Perakitan panel relay & jalur arus AC aman dan rapi.',
    longDetail: [
      'Marvel bertanggung jawab menata panel fisik: posisi modul relay, terminal blok, jalur kabel fasa & netral, jarak aman antar konduktor, serta orientasi komponen untuk alur servis yang mudah.',
      'Ia melakukan bundling & routing kabel terstruktur agar meminimalkan interferensi, mempermudah inspeksi lanjutan, dan mengurangi risiko panas lokal pada titik koneksi bertegangan.',
      'Kolaborasi dengan tim software dilakukan untuk mencocokkan label perangkat & channel relay sehingga sinkron antara dashboard, topik MQTT, dan label fisik di panel.'
    ],
    workflow: [
      'Menyiapkan layout panel & marking posisi relay',
      'Memotong & mengupas kabel sesuai panjang jalur',
      'Mengencangkan terminal blok & memastikan tidak ada kabel longgar',
      'Labeling channel relay agar konsisten dengan dashboard',
      'Uji continuity & inspeksi visual akhir'
    ],
    focus: ['Relay Mapping', 'Panel Layout', 'Safety'],
    type: 'hardware'
  },
  {
    name: 'Pandu',
    roles: ['Hardware Wiring Technician'],
    detail: 'Mendukung wiring & labeling koneksi terminal.',
    longDetail: [
      'Pandu membantu penyusunan koneksi antar modul relay, beban lampu & stopkontak, memastikan polaritas serta jalur fasa tidak tertukar dan mengikuti diagram.',
      'Ia melakukan pengecekan mekanis berulang (tarik & goyang ringan) untuk mendeteksi sambungan longgar yang berpotensi memicu panas berlebih atau percikan kecil.',
      'Selain itu ia menambahkan labeling tambahan di titik kritis (input supply, common relay, output beban) untuk memudahkan troubleshooting & audit keselamatan.'
    ],
    workflow: [
      'Mencocokkan diagram dengan implementasi fisik',
      'Menyusun & mengikat kabel sesuai jalur',
      'Labeling tambahan titik kritikal',
      'Cek tahanan sambungan (multimeter)',
      'Verifikasi akhir sebelum pengetesan daya'
    ],
    focus: ['Wiring Accuracy', 'Labeling', 'Continuity Check'],
    type: 'hardware'
  },
  {
    name: 'Farel Zachary',
    roles: ['Assembly & Testing'],
    detail: 'Pengujian fungsi channel relay & stabilitas respon.',
    longDetail: [
      'Farel fokus menguji konsistensi respon ON/OFF setiap channel menggunakan siklus berulang dan variasi interval untuk mendeteksi glitch status.',
      'Ia mencatat anomali potensial (mis: jeda respon, relay chatter, mismatch status dashboard) dan mendiskusikan rencana perbaikan dengan tim firmware & wiring.',
      'Tahap akhir meliputi validasi beban simultan multi-channel, pemantauan kestabilan supply, serta verifikasi ulang sebelum proyek didemokan.'
    ],
    workflow: [
      'Menjalankan siklus ON/OFF berulang tiap channel',
      'Mencatat waktu respon & memastikan sinkron dengan dashboard',
      'Observasi kestabilan supply saat multi-channel aktif',
      'Memberi masukan perbaikan fisik/firmware',
      'Validasi akhir sebelum demo'
    ],
    focus: ['Functional Test', 'Stability', 'Validation'],
    type: 'hardware'
  }
];

export default function TeamPage() {
  const [selected, setSelected] = useState<Member | null>(null);
  const openMember = useCallback((m: Member) => setSelected(m), []);
  const closeModal = useCallback(() => setSelected(null), []);

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 flex flex-col md:flex-row md:items-end gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Team & Developers</h1>
            <p className="text-gray-300 leading-relaxed max-w-2xl text-sm md:text-base">
              Inilah tim di balik proyek SmartHome ESP32-S2 Mini. Kolaborasi antara pengembang perangkat lunak, teknisi hardware, dan operasional server untuk menghadirkan sistem kendali 4-channel relay yang stabil & realtime.
            </p>
          </div>
          <div className="flex flex-col gap-3 self-start md:self-center">
            <Link href="/control/esp32-s2-mini" className="px-6 py-3 rounded-md bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-lg shadow-yellow-500/30 text-sm transition">→ Buka Control Panel</Link>
            <Link href="/team/hardware" className="px-6 py-3 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold border border-gray-700 text-sm transition flex items-center gap-2">📦 Daftar Hardware</Link>
          </div>
        </div>

        <section className="mb-20">
          <h2 className="text-2xl font-semibold mb-6 tracking-tight text-yellow-400">Software & Infrastructure</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {members.filter(m => m.type === 'software').map(m => (
              <MemberCard key={m.name} member={m} onClick={() => openMember(m)} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 tracking-tight text-yellow-400">Hardware & Wiring</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {members.filter(m => m.type === 'hardware').map(m => (
              <MemberCard key={m.name} member={m} onClick={() => openMember(m)} />
            ))}
          </div>
        </section>

        <div className="mt-24 border-t border-gray-800 pt-12 text-gray-400 text-sm leading-relaxed max-w-3xl">
          <p>
            Dokumentasi wiring panel berisi: diagram relay, channel assignment, jalur netral & fasa, serta isolasi beban AC. Keamanan menjadi prioritas utama: setiap sambungan diperiksa ulang dan penggunaan relay sesuai kapasitas arus.
          </p>
          <p className="mt-4">
            Pengembangan selanjutnya dapat mencakup: sensor suhu, monitoring konsumsi daya, logging historis, & integrasi autentikasi multi-user.
          </p>
        </div>

        <div className="mt-14">
          <Link href="/" className="text-sm text-gray-400 hover:text-yellow-400 transition">← Kembali ke Beranda</Link>
        </div>
        <MemberDetailModal open={!!selected} onClose={closeModal} member={selected} />
      </div>
    </main>
  );
}

function MemberCard({ member, onClick }: { member: Member; onClick: () => void }) {
  const color = member.type === 'software'
    ? 'from-blue-500/20 via-blue-500/5 border-blue-500/30'
    : 'from-emerald-500/20 via-emerald-500/5 border-emerald-500/30';
  return (
    <motion.button
      type="button"
      aria-label={`Lihat detail ${member.name}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onClick={onClick}
      className={`text-left p-6 rounded-xl bg-gradient-to-br ${color} border relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 hover:border-yellow-400/40 transition cursor-pointer`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
      <div className="relative">
        <h3 className="font-semibold text-lg mb-3 tracking-tight">{member.name}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {member.roles.map(r => (
            <span key={r} className="text-[10px] tracking-wide font-semibold uppercase bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300">{r}</span>
          ))}
        </div>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">{member.detail}</p>
        <div className="flex flex-wrap gap-2">
          {member.focus.map(f => (
            <span key={f} className="text-[10px] font-mono bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20">{f}</span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}
