import Link from 'next/link';

export const revalidate = 0;

export default function DokumentasiPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white px-6 py-20">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Dokumentasi PDF</h1>
          <p className="text-gray-400 max-w-2xl text-sm leading-relaxed">
            Halaman ini menghasilkan dokumen PDF (sekitar 75 halaman) berisi pembahasan arsitektur, topik MQTT, presence, kontrol relay, UI dashboard, roadmap keamanan, dan lampiran. Klik tombol unduh untuk memulai proses generasi on-demand.
          </p>
          <div className="flex gap-3">
            <a href="/api/dokumentasi" className="px-5 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm shadow shadow-yellow-500/30">Unduh PDF</a>
            <Link href="/" className="px-5 py-2 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm">&larr; Kembali</Link>
          </div>
          <div className="text-[11px] text-gray-500">
            Penyusun: <span className="text-gray-300">Samuel Indra Bastian</span> • Kelas: XI EIA • SMK PGRI 3 Malang
          </div>
        </header>
        <section className="space-y-6 text-sm leading-relaxed text-gray-300">
          <div>
            <h2 className="text-lg font-semibold tracking-tight mb-2">Ringkasan Isi</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Cover & Pendahuluan</li>
              <li>Arsitektur Sistem & Flow MQTT</li>
              <li>Struktur Topik & Presence Mechanism</li>
              <li>Kontrol Relay & Desain UI Panel</li>
              <li>Broker Metrics, Logging & Integrity</li>
              <li>Pengujian, Edge Cases, dan Recovery</li>
              <li>Roadmap Keamanan & Hardening</li>
              <li>Lampiran Konfigurasi & Contoh Kode</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/50">
            <h3 className="font-semibold mb-2 text-sm tracking-wide">Cara Kerja</h3>
            <p className="text-gray-400 text-[13px]">Endpoint <code className="bg-gray-800 px-1.5 py-0.5 rounded">/api/dokumentasi</code> membangkitkan PDF secara streaming menggunakan PDFKit. Konten base disusun lalu direplikasi dengan aman untuk memenuhi target panjang tanpa mengulang cover secara berlebihan.</p>
          </div>
          <div className="p-4 rounded-lg border border-yellow-600/30 bg-yellow-500/10 text-yellow-200 text-[13px]">
            Proses generate dapat memakan beberapa detik di perangkat dengan koneksi lambat. Jangan tutup tab sampai unduhan dimulai.
          </div>
        </section>
      </div>
    </main>
  );
}
