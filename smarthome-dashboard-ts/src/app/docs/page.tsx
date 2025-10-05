"use client";
import { useEffect, useMemo, useRef, useState } from 'react';

interface DocSection {
  id: string;
  title: string;
  body: React.ReactNode;
  children?: DocSection[];
}

// Full structured documentation dataset
const sections: DocSection[] = [
  {
    id: 'pendahuluan',
    title: '1. Pendahuluan',
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-gray-300">
        <p>Selamat datang di dokumentasi resmi Proyek Smart Home IoT. Dokumen ini memberikan pemahaman komprehensif terkait arsitektur, komponen, alur kerja, serta panduan operasional sistem.</p>
        <p>Sistem memanfaatkan ESP32-S2 Mini, protokol MQTT, dan antarmuka Next.js (TypeScript) dengan fokus fleksibilitas, keandalan, dan akses global.</p>
      </div>
    ),
    children: [
      {
        id: 'tujuan-proyek',
        title: '1.1. Tujuan Proyek',
        body: (
          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-300">
            <li><strong>Kontrol Jarak Jauh:</strong> Akses perangkat dari mana saja.</li>
            <li><strong>Fleksibilitas:</strong> Setup WiFi tanpa reflashing firmware.</li>
            <li><strong>Real-Time Monitoring:</strong> Pub/Sub status instan.</li>
            <li><strong>Skalabilitas:</strong> Mudah menambah node baru.</li>
            <li><strong>Keamanan:</strong> Broker privat (VPS) memberi kontrol penuh.</li>
          </ul>
        )
      },
      {
        id: 'ruang-lingkup',
        title: '1.2. Ruang Lingkup Dokumen',
        body: (
          <p className="text-sm text-gray-300 leading-relaxed">
            Mencakup: teknologi, arsitektur, firmware, antarmuka web, deployment, keamanan, pengujian, troubleshooting, serta pengembangan lanjutan. Tidak mencakup desain PCB manufaktur.
          </p>
        )
      },
      {
        id: 'target-pembaca',
        title: '1.3. Target Pembaca',
        body: (
          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-300">
            <li>Developer</li>
            <li>SysAdmin / DevOps</li>
            <li>Pengguna Teknis</li>
          </ul>
        )
      },
      {
        id: 'definisi-istilah',
        title: '1.4. Definisi & Istilah',
        body: (
          <dl className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              ['IoT', 'Jaringan perangkat fisik terhubung internet.'],
              ['MQTT', 'Protokol pub/sub ringan koneksi persisten.'],
              ['Broker', 'Perantara distribusi pesan antar klien.'],
              ['Topik', 'Saluran hierarkis untuk routing pesan.'],
              ['Firmware', 'Perangkat lunak tingkat rendah di MCU.'],
              ['VPS', 'Server privat virtual untuk hosting mandiri.']
            ].map(([k, v]) => (
              <div key={k} className="p-3 rounded border border-gray-800 bg-gray-900/50">
                <dt className="font-semibold text-gray-200">{k}</dt>
                <dd className="text-gray-400 text-xs mt-1 leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
        )
      }
    ]
  },
  {
    id: 'arsitektur-sistem',
    title: '2. Arsitektur Sistem',
    body: (
      <div className="space-y-6 text-sm leading-relaxed text-gray-300">
        <p>Arsitektur berbasiskan pola publish-subscribe dengan Mosquitto sebagai broker pusat.</p>
        <div className="border border-gray-800 rounded-lg p-6 bg-gradient-to-br from-gray-900/70 to-gray-800/30 text-center text-xs text-gray-400">
          <p className="font-semibold mb-2 text-yellow-400">[Diagram Arsitektur Sistem]</p>
          <p>Placeholder diagram: ESP32 Nodes ⇄ MQTT Broker ⇄ Web Dashboard.</p>
        </div>
        <h4 className="text-sm font-semibold text-gray-200">2.1 Komponen</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>ESP32 Node: kontrol relay.</li>
          <li>Broker: relay pesan efisien.</li>
          <li>Web Dashboard: UI real-time.</li>
        </ul>
        <h4 className="text-sm font-semibold text-gray-200">2.2 Alur</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li>UI publish perintah</li>
          <li>Broker distribusi</li>
          <li>ESP32 eksekusi relay</li>
          <li>ESP32 publish status retained</li>
          <li>UI update</li>
        </ol>
        <h4 className="text-sm font-semibold text-gray-200">2.3 Pertimbangan</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Tanpa polling → hemat bandwidth</li>
          <li>VPS privat → kontrol penuh</li>
          <li>WebSocket bridging browser</li>
        </ul>
      </div>
    )
  },
  {
    id: 'perangkat-keras',
    title: '3. Detail Perangkat Keras (Firmware)',
    body: (
      <div className="space-y-8 text-sm leading-relaxed text-gray-300">
        <div>
          <h4 className="font-semibold text-gray-200 mb-2">3.1 Pinout</h4>
            <div className="overflow-x-auto text-[11px]">
              <table className="w-full border border-gray-800 text-left">
                <thead className="bg-gray-800/70 text-gray-200">
                  <tr>
                    <th className="p-2 border-b border-gray-700">Perangkat</th>
                    <th className="p-2 border-b border-gray-700">GPIO</th>
                    <th className="p-2 border-b border-gray-700">Relay</th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  {[
                    ['Lampu 1','1','IN1'],
                    ['Lampu 2','2','IN2'],
                    ['Stop Kontak 1','3','IN3'],
                    ['Stop Kontak 2','4','IN4']
                  ].map(r => (
                    <tr key={r[0]} className="hover:bg-gray-800/40">
                      {r.map(c => <td key={c} className="p-2 border-b border-gray-800">{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-400">Ground semua modul harus terhubung bersama.</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-200 mb-2">3.2 Logika</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>WiFiManager AP fallback.</li>
            <li>Reconnect interval 5s.</li>
            <li>Callback parse topik → digitalWrite.</li>
            <li>Status retained.</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-200 mb-2">3.3 Struktur</h4>
          <pre className="text-[11px] bg-gray-950 rounded-lg p-3 border border-gray-800 overflow-x-auto"><code>{`setup(): init serial, pin, WiFi portal
loop(): client.loop() + reconnect
callback(): topik → aksi
reconnect(): connect + subscribe`}</code></pre>
        </div>
      </div>
    )
  },
  {
    id: 'server-broker',
    title: '4. Detail Server (MQTT Broker)',
    body: (
      <div className="space-y-8 text-sm leading-relaxed text-gray-300">
        <div>
          <h4 className="font-semibold mb-2">4.1 Konfigurasi</h4>
          <pre className="bg-gray-950 border border-gray-800 p-3 rounded text-[11px] overflow-x-auto"><code>{`listener 1883
listener 9001
protocol websockets
allow_anonymous true # produksi → false`}</code></pre>
        </div>
        <div>
          <h4 className="font-semibold mb-2">4.2 Firewall</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Buka 1883 & 9001.</li>
            <li>Uji eksternal tool.</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">4.3 Service (Windows)</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kelola via Services.</li>
            <li>Verbose: mosquitto -v.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'antarmuka-web',
    title: '5. Detail Antarmuka Web (Dasbor)',
    body: (
      <div className="space-y-8 text-sm leading-relaxed text-gray-300">
        <div>
          <h4 className="font-semibold mb-2">5.1 Fungsional</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>WebSocket MQTT.</li>
            <li>Wildcard subscribe.</li>
            <li>State reaktif.</li>
            <li>Publish ON/OFF.</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">5.2 Struktur</h4>
          <pre className="bg-gray-950 border border-gray-800 p-3 rounded text-[11px] overflow-x-auto"><code>{`page.tsx → init MQTT
DeviceCard.tsx → UI kontrol
Type definitions`}</code></pre>
        </div>
        <div>
          <h4 className="font-semibold mb-2">5.3 Deployment</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Push repo.</li>
            <li>Import Vercel.</li>
            <li>Deploy.</li>
          </ol>
        </div>
      </div>
    )
  },
  {
    id: 'panduan-setup',
    title: '6. Panduan Penggunaan & Setup',
    body: (
      <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-300">
        <li>Nyalakan node.</li>
        <li>Connect AP <code>SmartHome-Setup</code>.</li>
        <li>Buka portal 192.168.4.1.</li>
        <li>Pilih WiFi & simpan.</li>
        <li>Node connect broker.</li>
        <li>Kontrol via dashboard.</li>
      </ol>
    )
  },
  {
    id: 'referensi-mqtt',
    title: '7. Referensi API MQTT',
    body: (
      <div className="overflow-x-auto text-[11px]">
        <table className="w-full border border-gray-800 text-left">
          <thead className="bg-gray-800/70 text-gray-200">
            <tr>
              <th className="p-2 border-b border-gray-700">Tipe</th>
              <th className="p-2 border-b border-gray-700">Topik</th>
              <th className="p-2 border-b border-gray-700">Arah</th>
              <th className="p-2 border-b border-gray-700">Payload</th>
              <th className="p-2 border-b border-gray-700">Deskripsi</th>
            </tr>
          </thead>
          <tbody className="text-gray-400">
            {[
              ['Perintah','smarthome/lampu1/perintah','Web → ESP32','"ON"|"OFF"','Lampu 1'],
              ['Perintah','smarthome/lampu2/perintah','Web → ESP32','"ON"|"OFF"','Lampu 2'],
              ['Perintah','smarthome/stopkontak1/perintah','Web → ESP32','"ON"|"OFF"','Stop Kontak 1'],
              ['Perintah','smarthome/stopkontak2/perintah','Web → ESP32','"ON"|"OFF"','Stop Kontak 2'],
              ['Status','smarthome/lampu1/status','ESP32 → Web','"ON"|"OFF"','Status Lampu 1'],
              ['Status','smarthome/lampu2/status','ESP32 → Web','"ON"|"OFF"','Status Lampu 2'],
              ['Status','smarthome/stopkontak1/status','ESP32 → Web','"ON"|"OFF"','Status Stop Kontak 1'],
              ['Status','smarthome/stopkontak2/status','ESP32 → Web','"ON"|"OFF"','Status Stop Kontak 2']
            ].map(r => (
              <tr key={r.join('-')} className="hover:bg-gray-800/40">
                {r.map(c => <td key={c} className="p-2 border-b border-gray-800">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
  {
    id: 'keamanan-sistem',
    title: '8. Keamanan Sistem',
    body: (
      <div className="space-y-6 text-sm leading-relaxed text-gray-300">
        <div>
          <h4 className="font-semibold mb-2">8.1 Hardening</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>allow_anonymous false</li>
            <li>mosquitto_passwd -c ...</li>
            <li>password_file ...</li>
            <li>Restart broker</li>
            <li>Update klien</li>
          </ol>
        </div>
        <div>
          <h4 className="font-semibold mb-2">8.2 TLS</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Let&apos;s Encrypt</li>
            <li>Listener 8883 / 8081</li>
            <li>mqtts:// wss://</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'strategi-pengujian',
    title: '9. Strategi Pengujian',
    body: (
      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
        <li>Unit</li>
        <li>Integrasi</li>
        <li>E2E</li>
      </ul>
    )
  },
  {
    id: 'troubleshooting',
    title: '10. Troubleshooting',
    body: (
      <div className="space-y-4 text-sm text-gray-300">
        {[
          ['Status selalu Connecting', 'Pastikan node online & retained status tersedia'],
          ['Relay tidak respon', 'Cek publish topik perintah; bedakan wiring vs koneksi'],
          ['ECONNRESET', 'Port 1883/9001 mungkin tertutup'],
          ['Unable to add filesystem', 'Gunakan mqtt versi 4.x (4.3.7)']
        ].map(([p, s]) => (
          <div key={p} className="p-3 rounded border border-gray-800 bg-gray-900/60">
            <p className="font-semibold text-gray-200 text-xs mb-1">Masalah: {p}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">{s}</p>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'pengembangan-masa-depan',
    title: '11. Pengembangan di Masa Depan',
    body: (
      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
        <li>Sensor tambahan</li>
        <li>Autentikasi + TLS</li>
        <li>Aturan otomatis</li>
        <li>Historis data</li>
        <li>Aplikasi mobile</li>
      </ul>
    )
  },
  {
    id: 'lampiran',
    title: '12. Lampiran',
    body: (
      <div className="space-y-4 text-sm text-gray-300">
        <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/60 text-xs text-gray-400">
          <p className="font-semibold text-yellow-400 mb-2">Lampiran A: Skema</p>
          <p>[Placeholder Skema Listrik]</p>
        </div>
        <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/60 text-xs text-gray-400">
          <p className="font-semibold text-yellow-400 mb-2">Lampiran B: Log Perubahan</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>v1.0.0 (4 Okt 2025)</li>
            <li>v2.0.0 (5 Okt 2025)</li>
          </ul>
        </div>
      </div>
    )
  }
];

export default function DocsPage() {
  const [active, setActive] = useState('pendahuluan');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const flat = useMemo(() => {
    const arr: DocSection[] = [];
    sections.forEach(s => {
      arr.push(s);
      s.children?.forEach(c => arr.push(c));
    });
    return arr;
  }, []);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, { rootMargin: '0px 0px -70% 0px', threshold: [0, 0.25, 0.6] });

    flat.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [flat]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
  };

  const copyLink = (id: string) => {
    const base = window.location.href.split('#')[0];
    navigator.clipboard.writeText(base + '#' + id);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white px-4 md:px-8 py-14 print:bg-white print:text-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
        <aside className="lg:sticky lg:top-20 h-max bg-gray-900/60 border border-gray-800 rounded-xl p-4 backdrop-blur print:hidden" aria-label="Daftar Isi Dokumen">
          <h2 className="text-sm font-semibold tracking-wide text-gray-200 mb-4">Daftar Isi</h2>
          <nav className="space-y-3 text-[13px]" role="navigation">
            {sections.map(sec => (
              <div key={sec.id}>
                <button
                  onClick={() => scrollTo(sec.id)}
                  className={`block w-full text-left transition rounded px-2 py-1.5 mb-1 focus:outline-none focus:ring focus:ring-yellow-500/40 ${active === sec.id ? 'bg-yellow-500/20 text-yellow-300' : 'hover:bg-gray-800/60 text-gray-300'}`}
                >
                  {sec.title}
                </button>
                {sec.children && (
                  <div className="pl-3 border-l border-gray-800 space-y-0.5">
                    {sec.children.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => scrollTo(ch.id)}
                        className={`block w-full text-left rounded px-2 py-1 text-[12px] transition focus:outline-none focus:ring focus:ring-yellow-500/40 ${active === ch.id ? 'bg-yellow-500/20 text-yellow-300' : 'hover:bg-gray-800/60 text-gray-400'}`}
                      >
                        {ch.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>
        <div className="space-y-16">
          <header className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dokumentasi Lengkap Sistem Kontrol Smart Home IoT</h1>
            <p className="text-sm text-gray-400">Versi 2.0.0 • Revisi 5 Oktober 2025 • Tim SKARIGA EIA</p>
          </header>
          {sections.map(section => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-3">
                {section.title}
                <button
                  aria-label="Copy link"
                  onClick={() => copyLink(section.id)}
                  className="text-[10px] px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 focus:outline-none focus:ring focus:ring-yellow-500/40"
                >
                  #
                </button>
              </h2>
              {section.body}
              {section.children && (
                <div className="mt-10 space-y-12">
                  {section.children.map(sub => (
                    <div key={sub.id} id={sub.id} className="scroll-mt-24">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        {sub.title}
                        <button
                          aria-label="Copy link"
                          onClick={() => copyLink(sub.id)}
                          className="text-[10px] px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 focus:outline-none focus:ring focus:ring-yellow-500/40"
                        >
                          #
                        </button>
                      </h3>
                      {sub.body}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="fixed bottom-6 right-6 z-40 print:hidden">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 rounded-full bg-yellow-500 text-black shadow-lg shadow-yellow-500/30 text-xs font-semibold hover:bg-yellow-400 focus:outline-none focus:ring focus:ring-yellow-500/50"
              aria-label="Kembali ke atas"
            >
              ↑ Top
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
