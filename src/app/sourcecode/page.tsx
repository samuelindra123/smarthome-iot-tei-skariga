"use client";
import { useState } from 'react';

// Source Code / Open Repository Showcase Page
// This page is created for highlighting the Samuel team's web dashboard source code
// Features:
// - Hero section with project identity
// - GitHub profile & repo cards (placeholder links, replace with real ones)
// - Clone command with copy button
// - Project structure snippet
// - Portfolio / external links section
// - Subtle animated accents using Tailwind utility classes

interface LinkCard {
  title: string;
  description: string;
  url: string;
  badge?: string;
}

const githubProfile = {
  username: 'samuelindra123', // adjust if different
  url: 'https://github.com/devwebxyn',
  tagline: 'Membangun solusi IoT, web realtime, dan sistem terintegrasi.'
};

const repoInfo = {
  name: 'smarthome-iot-tei-skariga',
  // store base repo URL WITHOUT trailing .git so we can add it exactly once in clone command
  url: 'https://github.com/samuelindra123/smarthome-iot-tei-skariga',
  description: 'Dashboard kontrol Smart Home IoT (Next.js + MQTT) dengan fitur real-time dan dokumentasi terstruktur.'
};

const portfolioLinks: LinkCard[] = [
  {
    title: 'Portfolio Samuel',
    description: 'Kunjungi showcase project, eksperimen, dan studi kasus teknis.',
    url: 'https://www.samuelindrabastian.me',
    badge: 'Portfolio'
  },
  {
    title: 'Contact / Email',
    description: 'Hubungi untuk kolaborasi atau diskusi teknologi.',
    url: 'mailto:mesakzitumpul@mail.com',
    badge: 'Email'
  }
];

const projectTree = `smarthome-dashboard-ts/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                # Landing / marketing
│  │  ├─ control/esp32-s2-mini/  # Halaman kontrol perangkat
│  │  ├─ docs/                   # Dokumentasi lengkap
│  │  ├─ roadmap/                # Roadmap interaktif
│  │  └─ sourcecode/             # (Halaman ini)
│  ├─ components/                # Reusable UI (DeviceCard, Header, dll)
│  └─ styles/ (opsional)
├─ public/                       # Static assets (ikon, svg)
├─ package.json
├─ README.md
└─ tsconfig.json`;

export default function SourceCodePage() {
  const [copied, setCopied] = useState(false);
  const cloneCmd = `git clone ${repoInfo.url}.git`;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white px-5 md:px-12 py-16 relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent)]" style={{background:"linear-gradient(125deg,#1e293b,#020617,#0f172a)"}} />

      <div className="max-w-6xl mx-auto relative space-y-20">
        {/* Hero */}
        <section className="space-y-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
            Source Code Dashboard Smart Home
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Halaman ini memuat referensi cepat untuk repositori dan profil developer utama yang membangun sistem ini. Temukan struktur proyek, cara clone, dan tautan eksternal untuk eksplorasi lebih lanjut.
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] uppercase tracking-wide text-gray-400">
            <span className="px-3 py-1 rounded-full bg-gray-800/60 border border-gray-700">Next.js</span>
            <span className="px-3 py-1 rounded-full bg-gray-800/60 border border-gray-700">TypeScript</span>
            <span className="px-3 py-1 rounded-full bg-gray-800/60 border border-gray-700">MQTT</span>
            <span className="px-3 py-1 rounded-full bg-gray-800/60 border border-gray-700">ESP32</span>
          </div>
        </section>

        {/* Profile & Repo */}
        <section className="grid md:grid-cols-2 gap-8">
          <a href={githubProfile.url} target="_blank" rel="noopener noreferrer" className="group relative rounded-2xl border border-gray-800 bg-gray-900/50 p-6 overflow-hidden focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition bg-gradient-to-br from-yellow-400/20 to-transparent" />
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><span className="text-yellow-400">@</span>{githubProfile.username}</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{githubProfile.tagline}</p>
            <span className="inline-flex items-center gap-2 text-sm text-yellow-300 group-hover:text-yellow-200 font-medium">Kunjungi Profil →</span>
            <span className="absolute inset-0" aria-hidden="true" />
          </a>
          <a href={repoInfo.url} target="_blank" rel="noopener noreferrer" className="group relative rounded-2xl border border-gray-800 bg-gray-900/50 p-6 overflow-hidden focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition bg-gradient-to-br from-yellow-400/20 to-transparent" />
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">Repo: <span className="text-yellow-400">{repoInfo.name}</span></h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{repoInfo.description}</p>
            <span className="inline-flex items-center gap-2 text-sm text-yellow-300 group-hover:text-yellow-200 font-medium">Buka di GitHub →</span>
            <span className="absolute inset-0" aria-hidden="true" />
          </a>
        </section>

        {/* Clone Command */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">Clone Repositori</h3>
          <p className="text-sm text-gray-400">Gunakan perintah berikut untuk mendapatkan salinan lokal:</p>
          <div className="relative">
            <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-x-auto text-[12px] text-yellow-200 shadow-lg shadow-black/40"><code>{cloneCmd}</code></pre>
            <button onClick={() => copy(cloneCmd)} className="absolute top-2 right-2 text-[11px] px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700">
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </section>

        {/* Project Tree */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">Struktur Proyek</h3>
          <p className="text-sm text-gray-400">Ringkasan folder utama untuk navigasi cepat.</p>
          <pre className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-lg p-5 text-[11px] leading-relaxed text-gray-300 overflow-x-auto"><code>{projectTree}</code></pre>
        </section>

        {/* Portfolio / External Links */}
        <section className="space-y-6">
          <h3 className="text-xl font-semibold tracking-tight">Tautan Eksternal & Portfolio</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioLinks.map(link => (
              <a key={link.url} href={link.url} target="_blank" className="group relative rounded-xl border border-gray-800 bg-gray-900/40 p-5 flex flex-col gap-3 hover:border-yellow-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-100 group-hover:text-yellow-300 transition">{link.title}</span>
                  {link.badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">{link.badge}</span>}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed flex-1">{link.description}</p>
                <span className="text-[11px] text-yellow-300 group-hover:text-yellow-200">Kunjungi →</span>
              </a>
            ))}
          </div>
          <p className="text-[11px] text-gray-500">Catatan: Ganti tautan placeholder dengan alamat resmi (domain portfolio, LinkedIn, email, dsb).</p>
        </section>

        {/* Footer Note */}
        <footer className="pt-10 pb-6 text-center text-[11px] text-gray-500 border-t border-gray-800">
          Dibuat dengan ❤️ oleh Tim Samuel • {new Date().getFullYear()} • Smart Home IoT Dashboard
        </footer>
      </div>
    </main>
  );
}
