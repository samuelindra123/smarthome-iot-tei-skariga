import Link from 'next/link';

export const metadata = {
  title: 'Download - SmartHome SKARIGA',
};

export default function DownloadPage() {
  const apkPath = '/app/build/outputs/apk/debug/app-debug.apk';

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <section className="bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 border border-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 bg-yellow-500 rounded-xl flex items-center justify-center text-black text-2xl font-bold">SH</div>
            <div>
              <h1 className="text-3xl font-extrabold">SmartHome SKARIGA — Aplikasi Android</h1>
              <p className="mt-2 text-gray-200">Instal aplikasi untuk kontrol penuh perangkat IoT Anda. Versi ini adalah debug build untuk pengujian internal.</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Unduh & Pasang</h2>
              <p className="text-gray-300">Klik tombol di bawah untuk mengunduh APK debug dan ikuti instruksi pemasangan (aktifkan &quot;Install from unknown sources&quot; jika perlu).</p>

              <a href={apkPath} download className="inline-block bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg shadow hover:brightness-95 transition">Download APK</a>

              <div className="pt-4 text-sm text-gray-300">
                <p><strong>Path lokal (repo):</strong> <code className="bg-black/30 px-2 py-1 rounded">{apkPath}</code></p>
                <p className="mt-2">Untuk pengujian di perangkat, transfer file APK ke ponsel dan buka untuk menginstal. Untuk pengujian via ADB: <code className="bg-black/30 px-2 py-1 rounded">adb install -r app-debug.apk</code></p>
              </div>
            </div>

            <div className="bg-gray-900/40 p-4 rounded-lg">
              <h3 className="font-semibold">Catatan penting</h3>
              <ul className="mt-2 list-disc ml-5 text-gray-300 space-y-2">
                <li>Build ini menggunakan debug keystore yang tersimpan di repositori untuk kemudahan pengujian.</li>
                <li>Jika Anda ingin paket resmi Play Store, kami perlu menandatangani dengan keystore produksi dan membuat AAB.</li>
                <li>Tanpa Digital Asset Links, TWA mungkin menampilkan sedikit chrome; ini normal untuk pengujian.</li>
              </ul>

              <div className="mt-4 bg-gray-800/50 p-3 rounded">
                <h4 className="font-medium">Periksa flow aplikasi</h4>
                <ol className="mt-2 list-decimal ml-5 text-gray-300">
                  <li>Buka aplikasi, pastikan layar login muncul.</li>
                  <li>Login dengan akun uji, pastikan dashboard muncul dan kontrol perangkat berfungsi.</li>
                  <li>Periksa bahwa header/footer global tidak terlihat ketika aplikasi berjalan sebagai standalone/TWA.</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-300">Kembali ke <Link href="/" className="text-yellow-400 hover:underline">Beranda</Link></div>
        </section>
      </div>
    </main>
  );
}
