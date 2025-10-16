"use client";
import Link from 'next/link';

export const revalidate = 0;

export default function HubungiAdminPage() {
  // Admin WhatsApp number provided by user: +62882019494158
  const waNumber = '62882019494158';
  const waText = encodeURIComponent('Halo Admin, saya butuh akses akun untuk SmartHome SKARIGA. Mohon bantuan.');
  const waHref = `https://wa.me/${waNumber}?text=${waText}`;

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white px-6 py-20">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Hubungi Admin</h1>
          <p className="text-gray-400">Jika Anda membutuhkan akses akun atau bantuan, silakan hubungi admin melalui WhatsApp.</p>
        </header>

        <section className="bg-gray-900/60 border border-gray-800 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-300 mb-4">Nomor admin (WhatsApp):</p>
          <div className="text-xl font-medium text-yellow-300 mb-4">+62 882‑0194‑94158</div>
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-5 py-3 rounded bg-green-600 hover:bg-green-500 text-white font-semibold">
            Buka WhatsApp &nbsp;↗
          </a>
          <div className="mt-4 text-sm text-gray-400">
            Atau kembali ke <Link href="/login" className="text-yellow-400">halaman login</Link>.
          </div>
        </section>

        <section className="text-sm text-gray-500">
          <h3 className="font-semibold mb-2">Catatan</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nomor admin sudah diberikan oleh pemilik proyek.</li>
            <li>Pesan yang dikirim berisi permintaan akses; mohon sertakan identitas (nama & sekolah) untuk proses verifikasi.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
