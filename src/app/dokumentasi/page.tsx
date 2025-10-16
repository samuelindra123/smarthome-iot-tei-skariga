import Link from 'next/link';

export const revalidate = 0;

interface InfraItem {
  name: string;
  category: string;
  purpose: string;
  tech: string;
  icon: string;
}

const infrastructure: InfraItem[] = [
  {
    name: 'Frontend Dashboard',
    category: 'Web Application',
    purpose: 'User interface untuk monitoring dan kontrol perangkat IoT secara real-time',
    tech: 'Next.js 15 (App Router), TypeScript, Tailwind CSS, React',
    icon: '⚛️'
  },
  {
    name: 'Hosting & Deployment',
    category: 'Cloud Platform',
    purpose: 'Deploy dan hosting aplikasi web dengan CI/CD otomatis',
    tech: 'AWS Amplify (Git-based deployment, CDN global, SSL auto)',
    icon: '☁️'
  },
  {
    name: 'Authentication & Database',
    category: 'Backend Service',
    purpose: 'Manajemen user, autentikasi, dan penyimpanan data pengguna',
    tech: 'Appwrite (Cloud) - Account sessions, Database, API',
    icon: '🔐'
  },
  {
    name: 'MQTT Broker VPS',
    category: 'Message Broker',
    purpose: 'Real-time communication antara dashboard dan perangkat ESP32',
    tech: 'AWS Lightsail VPS - Mosquitto MQTT broker dengan WebSocket (wss://)',
    icon: '📡'
  },
  {
    name: 'IoT Devices',
    category: 'Hardware',
    purpose: 'Microcontroller untuk kontrol relay dan sensor',
    tech: 'ESP32-S2 Mini, relay modules, sensors',
    icon: '🔌'
  },
  {
    name: 'Real-time Protocol',
    category: 'Communication',
    purpose: 'Protocol pub/sub untuk device command dan status updates',
    tech: 'MQTT over WebSocket (mqtt.js client library)',
    icon: '🔄'
  }
];

export default function InfrastructurePage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white px-6 py-20">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Infrastructure & Tech Stack</h1>
          <p className="text-gray-400 max-w-3xl text-sm leading-relaxed">
            Sistem Smart Home IoT SKARIGA dibangun dengan arsitektur modern menggunakan layanan cloud terpercaya dan protokol IoT standar industri. Berikut adalah komponen infrastruktur yang digunakan dalam proyek ini.
          </p>
          <div className="flex gap-3">
            <Link href="/" className="px-5 py-2 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm">&larr; Kembali</Link>
          </div>
          <div className="text-[11px] text-gray-500">
            Project by: <span className="text-gray-300">Samuel Indra Bastian</span> • SMK PGRI 3 Malang
          </div>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          {infrastructure.map((item, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-900/40 hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{item.icon}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.purpose}</p>
                  <div className="pt-2">
                    <code className="text-xs bg-gray-800/80 px-2 py-1 rounded text-green-400 border border-gray-700">
                      {item.tech}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-6 mt-12">
          <h2 className="text-2xl font-bold tracking-tight">Architecture Flow</h2>
          <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">1</div>
                <p><span className="font-semibold text-white">User Access:</span> Pengguna mengakses dashboard melalui AWS Amplify (CDN global dengan HTTPS)</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">2</div>
                <p><span className="font-semibold text-white">Authentication:</span> Login via Appwrite menggunakan email/password, session disimpan sebagai cookie</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">3</div>
                <p><span className="font-semibold text-white">MQTT Connection:</span> Browser terhubung ke Mosquitto broker di AWS Lightsail via WebSocket (wss://)</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">4</div>
                <p><span className="font-semibold text-white">Device Control:</span> Dashboard publish command ke topik MQTT, ESP32 subscribe dan eksekusi perintah relay</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">5</div>
                <p><span className="font-semibold text-white">Status Updates:</span> ESP32 publish status device, dashboard subscribe dan update UI secara real-time</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 rounded-lg border border-green-600/30 bg-green-500/10">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-semibold text-green-400 text-sm mb-1">Scalable</h3>
            <p className="text-xs text-gray-400">Cloud infrastructure yang dapat scale sesuai kebutuhan traffic</p>
          </div>
          <div className="p-4 rounded-lg border border-blue-600/30 bg-blue-500/10">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-blue-400 text-sm mb-1">Secure</h3>
            <p className="text-xs text-gray-400">TLS/SSL encryption untuk semua koneksi, autentikasi Appwrite</p>
          </div>
          <div className="p-4 rounded-lg border border-purple-600/30 bg-purple-500/10">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-purple-400 text-sm mb-1">Real-time</h3>
            <p className="text-xs text-gray-400">MQTT protocol untuk komunikasi instan antara device dan dashboard</p>
          </div>
        </section>

        <section className="p-6 rounded-xl border border-yellow-600/30 bg-yellow-500/5 mt-8">
          <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
            <span>💡</span> Infrastructure Highlights
          </h3>
          <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
            <li><strong>Cost-effective:</strong> AWS Lightsail memberikan harga VPS yang terjangkau untuk MQTT broker</li>
            <li><strong>Developer-friendly:</strong> Appwrite menyediakan SDK dan API yang mudah digunakan untuk auth dan database</li>
            <li><strong>Modern stack:</strong> Next.js 15 dengan App Router dan TypeScript untuk type-safe development</li>
            <li><strong>Global reach:</strong> AWS Amplify CDN memastikan dashboard dapat diakses dengan cepat dari seluruh dunia</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
