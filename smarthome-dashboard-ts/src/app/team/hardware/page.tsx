'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Item {
  id: string;
  name: string;
  category: 'hardware' | 'software';
  description: string;
  image: string;
  specs?: string[];
  role?: string;
}

const items: Item[] = [
  { id: 'esp32-s2-mini', name: 'ESP32-S2 Mini', category: 'hardware', image: '/hardware/esp32-s2-mini.svg', description: 'Mikrokontroler utama dengan Wi-Fi terintegrasi, menangani koneksi MQTT & kontrol relay.', specs: ['CPU Xtensa Single-Core', 'Wi-Fi 2.4GHz', 'Native USB'], role: 'Core processing & MQTT client' },
  { id: 'relay-4ch-5v', name: 'Relay 4 Channel 5V', category: 'hardware', image: '/hardware/relay-4ch-5v.svg', description: 'Memutus / menyambung arus AC ke beban (2 lampu + 2 stopkontak).', specs: ['4 Independent Channels', 'Opto-Isolated'], role: 'Switching Aktuator' },
  { id: 'terminal-block', name: 'Terminal Block', category: 'hardware', image: '/hardware/terminal-block.svg', description: 'Distribusi & pengelompokan jalur kabel agar rapi dan aman.', role: 'Distribusi Fisik' },
  { id: 'mcb-1p-2a', name: 'MCB 1P 2A', category: 'hardware', image: '/hardware/mcb-1p-2a.svg', description: 'Perlindungan dasar terhadap arus lebih / short kecil.', role: 'Proteksi Dasar' },
  { id: 'power-supply-12v-3a', name: 'Power Supply 12V 3A', category: 'hardware', image: '/hardware/power-supply-12v-3a.svg', description: 'Sumber utama tegangan DC sebelum diturunkan untuk modul.', role: 'Primary DC Source' },
  { id: 'stepdown-dc-3-32v', name: 'Stepdown DC 3-32V', category: 'hardware', image: '/hardware/stepdown-dc-3-32v.svg', description: 'Menurunkan tegangan ke level yang stabil untuk ESP & relay.', role: 'Regulasi Tegangan' },
  { id: 'lamp-fittings', name: 'Fitting Lampu (x2)', category: 'hardware', image: '/hardware/lamp-socket.svg', description: 'Beban lampu untuk uji switching visual cepat.', role: 'Output Beban 1-2' },
  { id: 'wall-socket', name: 'Stop Kontak (x2)', category: 'hardware', image: '/hardware/wall-socket.svg', description: 'Beban AC fleksibel (misal charger / adaptor) untuk pengujian.' , role: 'Output Beban 3-4'},
  { id: 'panel-board', name: 'Papan Panel Kerja', category: 'hardware', image: '/hardware/panel-board.svg', description: 'Media mounting komponen agar terorganisir & aman.', role: 'Media Mekanis' },
  { id: 'windows-server-2022', name: 'Windows Server 2022 VPS', category: 'software', image: '/hardware/windows-server-2022.svg', description: 'Host layanan broker MQTT & manajemen akses remote.', role: 'Hosting Layer' },
  { id: 'mqtt-broker', name: 'MQTT Broker', category: 'software', image: '/hardware/mqtt-broker.svg', description: 'Layanan messaging publish/subscribe untuk status & perintah.', role: 'Messaging Core' },
  { id: 'mqtt-explorer', name: 'MQTT Explorer', category: 'software', image: '/hardware/mqtt-explorer.svg', description: 'Alat debugging untuk inspeksi topik & payload.', role: 'Debug Tool' },
];

export default function HardwarePage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 flex flex-col md:flex-row md:items-end gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Hardware & Software Stack</h1>
            <p className="text-gray-300 leading-relaxed max-w-2xl text-sm md:text-base">Daftar komponen fisik & perangkat lunak yang digunakan dalam proyek SmartHome ESP32-S2 Mini. Setiap item disertai peran fungsional untuk memperjelas alur sistem.</p>
          </div>
          <Link href="/team" className="self-start md:self-center px-6 py-3 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold border border-gray-700 text-sm transition">← Kembali ke Tim</Link>
        </div>

        <Section title="Perangkat Keras (Hardware)">
          <Grid items={items.filter(i => i.category === 'hardware')} />
        </Section>

        <Section title="Perangkat Lunak (Software & Layanan)">
          <Grid items={items.filter(i => i.category === 'software')} />
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-24">
      <h2 className="text-2xl font-bold mb-8 tracking-tight text-yellow-400">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ items }: { items: Item[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map(item => (
        <Card key={item.id} item={item} />
      ))}
    </div>
  );
}

function Card({ item }: { item: Item }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative p-5 rounded-xl bg-gradient-to-br from-gray-900/70 via-gray-900/40 to-gray-800/30 border border-gray-800 hover:border-yellow-500/40 group overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="relative flex flex-col h-full">
        <div className="flex items-center justify-center mb-4">
          <Image src={item.image} alt={item.name} width={160} height={120} className="object-contain" />
        </div>
        <h3 className="font-semibold mb-2 tracking-tight text-sm">{item.name}</h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-4">{item.description}</p>
        {item.role && <span className="mt-auto text-[10px] font-mono bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20 inline-block">{item.role}</span>}
      </div>
    </motion.div>
  );
}
