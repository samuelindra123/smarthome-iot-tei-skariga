// src/components/DownloadClientContent.tsx
"use client"; // Komponen ini adalah Client Component

import Link from 'next/link';
// Sesuaikan path jika perlu, ini mengasumsikan komponen ada di src/components
import { MotionSection, MotionDiv } from './Animated';

// --- Ikon SVG Sederhana ---
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 inline-block mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

// --- Props (jika perlu melewatkan data dari Server Component) ---
interface DownloadClientContentProps {
  apkPath: string;
  appIconPath: string;
}

// --- Komponen Halaman (Bagian Klien) ---
export default function DownloadClientContent({ apkPath, appIconPath }: DownloadClientContentProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">

      {/* Header Section */}
      <MotionSection
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <img src={appIconPath} alt="App Icon" className="w-24 h-24 mx-auto mb-6 rounded-3xl shadow-lg border-2 border-yellow-500/50" />
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
          SmartHome SKARIGA
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Kontrol rumah pintar Anda langsung dari genggaman. Unduh aplikasi Android kami sekarang.
        </p>
      </MotionSection>

      {/* Download & Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

        {/* Download Card */}
        <MotionDiv
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-b from-gray-800/60 to-gray-900/80 border border-gray-700 rounded-2xl p-8 shadow-xl backdrop-blur-sm"
        >
          <h2 className="text-2xl font-bold mb-5 text-yellow-400">Unduh Aplikasi</h2>
          <p className="text-gray-300 mb-6">
            Dapatkan versi terbaru aplikasi SmartHome SKARIGA untuk Android. Klik tombol di bawah ini untuk memulai pengunduhan.
          </p>
          <a
            href={apkPath}
            download
            className="w-full flex items-center justify-center bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-8 py-4 rounded-lg shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-300 text-lg transform hover:scale-105"
          >
            <DownloadIcon />
            Unduh APK Sekarang
          </a>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Versi: Debug Build | Ukuran: 6.3 MB
          </p>
          <div className="mt-8 border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-3">Cara Instalasi:</h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-2 text-sm">
              <li>Setelah unduhan selesai, buka file APK.</li>
              <li>Jika diminta, izinkan instalasi dari &apos;Sumber Tidak Dikenal&apos; (Unknown Sources) di pengaturan keamanan ponsel Anda.</li>
              <li>Ikuti petunjuk di layar untuk menyelesaikan instalasi.</li>
              <li>Buka aplikasi dan login untuk mulai mengontrol perangkat Anda.</li>
            </ol>
          </div>
        </MotionDiv>

        {/* Information Card */}
        <MotionDiv
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center text-blue-400">
              <InfoIcon /> Informasi Versi
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
              <li>Ini adalah versi aplikasi yang ditujukan untuk pengenalan dan uji coba fitur.</li>
              <li>Aplikasi ini dibangun sebagai Trusted Web Activity (TWA) yang terhubung langsung ke dashboard web kami.</li>
              <li>Untuk rilis resmi di Play Store, akan ada proses penandatanganan dan build yang berbeda (menggunakan AAB).</li>
            </ul>
          </div>
          <details className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 group">
            <summary className="text-lg font-semibold cursor-pointer text-gray-400 group-open:text-purple-400 transition-colors">
              Catatan untuk Pengembang/Penguji
            </summary>
            <div className="mt-4 space-y-3 text-sm text-gray-400">
              <p><strong>Flow Pengujian:</strong></p>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>Verifikasi layar login muncul saat pertama kali dibuka.</li>
                <li>Pastikan login berhasil dan dashboard/kontrol perangkat berfungsi normal.</li>
                <li>Konfirmasi bahwa elemen web (seperti header/footer global) tidak tampil di dalam TWA.</li>
              </ol>
              <p className="pt-2"><strong>Path File APK di Repo:</strong> <br /> <code className="bg-black/50 px-2 py-1 rounded text-xs">{apkPath}</code></p>
              <p><strong>Instalasi via ADB:</strong> <br /> <code className="bg-black/50 px-2 py-1 rounded text-xs">adb install -r path/to/app-debug.apk</code></p>
            </div>
          </details>
        </MotionDiv>
      </div>

      {/* Back Link */}
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-16 text-center text-sm text-gray-400"
      >
        Kembali ke <Link href="/" className="text-yellow-400 hover:text-yellow-300 hover:underline">Halaman Utama</Link>
      </MotionDiv>
    </div>
  );
}