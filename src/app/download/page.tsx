// src/app/download/page.tsx
// HAPUS "use client"; dari sini

import DownloadClientContent from '../../components/DownloadClientContent'; // Impor komponen klien

// --- Metadata Halaman (Tetap di sini - Server Component) ---
export const metadata = {
  title: 'Download Aplikasi SmartHome SKARIGA',
  description: 'Unduh aplikasi Android SmartHome SKARIGA untuk mengontrol perangkat IoT Anda dengan mudah.',
};

// --- Komponen Halaman (Server Component) ---
export default function DownloadPage() {
  // Path bisa didefinisikan di sini (Server)
  const apkPath = '/apk/smarthome-skariga.apk';
  const appIconPath = '/icons/android-chrome-192x192.png'; // Contoh

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 text-white font-sans">
      {/* Gunakan komponen klien dan lewatkan data sebagai props */}
      <DownloadClientContent
        apkPath={apkPath}
        appIconPath={appIconPath}
      />
    </main>
  );
}

// Hapus definisi ikon dan logika klien lainnya dari sini