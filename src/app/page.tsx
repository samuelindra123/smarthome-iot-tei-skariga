import Link from 'next/link';

// Ensure this page is rendered dynamically (SSR) to avoid static export
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative px-6 pt-28 pb-32 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-14">
        <div className="flex-1">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full mb-6 border border-yellow-500/20">Proyek Sekolah IoT</span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6">
            SmartHome ESP32-S2 Mini<br/>
            <span className="text-yellow-400">Kendali 4-Channel Relay</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-xl mb-8">
            Platform pembelajaran IoT oleh siswa SKARIGA untuk mengendalikan 2 lampu dan 2 stopkontak AC secara realtime melalui MQTT WebSocket menggunakan modul ESP32-S2 Mini dan dashboard modern berbasis Next.js.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/control/esp32-s2-mini" className="px-7 py-3 rounded-md font-semibold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors text-center shadow-lg shadow-yellow-500/20">
              Buka Control Panel
            </Link>
            <a href="#fitur" className="px-7 py-3 rounded-md font-semibold bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-center">
              Lihat Fitur
            </a>
          </div>
        </div>
        <div className="flex-1 max-w-md md:max-w-lg relative">
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-yellow-400/20 via-yellow-500/5 to-transparent border border-yellow-500/20 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center p-6">
              <div className="text-7xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-yellow-200 to-yellow-500 mb-4">IoT</div>
              <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">ESP32-S2 Mini terhubung ke MQTT Broker memancarkan status realtime dan menerima perintah kendali.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Section */}
      <section id="fitur" className="px-6 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 tracking-tight">Fitur Utama</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Realtime MQTT', desc: 'Komunikasi instan status & perintah via WebSocket tanpa refresh.' },
            { title: '4-Channel Relay', desc: 'Kontrol 2 lampu dan 2 stopkontak AC dengan modul relay terisolasi.' },
            { title: 'ESP32-S2 Mini', desc: 'Mikrokontroler Wi-Fi hemat daya dengan dukungan WebUSB & native USB.' },
            { title: 'Dashboard Modern', desc: 'UI responsif berbasis Next.js 14 dan Tailwind CSS.' },
            { title: 'Tipe Aman', desc: 'TypeScript memastikan reliability dalam state & event handling.' },
            { title: 'Open Source', desc: 'Kode siap dikembangkan & dikolaborasikan oleh tim siswa.' },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-yellow-500/40 transition-colors">
              <h3 className="font-semibold mb-2 text-lg text-yellow-400">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tentang Section */}
      <section id="tentang" className="px-6 pb-32 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 tracking-tight">Tentang Proyek</h2>
        <div className="space-y-5 text-gray-300 leading-relaxed text-base">
          <p>SmartHome SKARIGA adalah proyek pembelajaran terapan di bidang Internet of Things (IoT) yang menggabungkan perangkat keras ESP32-S2 Mini dengan protokol MQTT dan aplikasi web modern. Fokusnya adalah memahami ekosistem perangkat terhubung dan bagaimana membangun kontrol yang aman, cepat, dan mudah diakses.</p>
          <p>Sistem menggunakan relay 4 channel untuk mengendalikan dua lampu dan dua stopkontak AC. Status setiap kanal dipublikasikan secara realtime ke broker MQTT dan dashboard menampilkan perubahan secara instan. Pengguna dapat mengirim perintah ON/OFF yang langsung diteruskan ke mikrokontroler.</p>
          <p>Proyek ini dapat dikembangkan lebih jauh: penjadwalan otomatis, integrasi sensor suhu/kelembaban, autentikasi pengguna, logging energi, hingga integrasi AI prediksi penggunaan.</p>
        </div>
        <div className="mt-10">
          <Link href="/control/esp32-s2-mini" className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 font-semibold rounded-md shadow-lg shadow-yellow-500/30 transition">Coba Kendali Sekarang →</Link>
        </div>
      </section>
    </main>
  );
}

// redeploy-trigger: minor whitespace edit