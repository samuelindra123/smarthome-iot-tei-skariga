import Link from 'next/link';
import { useState } from 'react';
import { useDisplayMode } from '../lib/useDisplayMode';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { isStandalone } = useDisplayMode();

  // Hide global header in standalone/TWA mode — the app uses app chrome instead
  if (isStandalone) return null;

  return (
    <header className="w-full bg-gray-900/70 backdrop-blur border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center">
        <div className="flex items-center mr-4">
          <Link href="/" className="text-xl font-bold tracking-tight">SmartHome SKARIGA</Link>
        </div>

        {/* center nav */}
        <div className="flex-1 flex justify-center">
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link href="/" className="hover:text-yellow-400 transition-colors">Beranda</Link>
            <Link href="/team" className="hover:text-yellow-400 transition-colors">Team & Developers</Link>
            <Link href="/roadmap" className="hover:text-yellow-400 transition-colors">Roadmap</Link>
            <Link href="/docs" className="hover:text-yellow-400 transition-colors">Docs</Link>
            <Link href="/sourcecode" className="hover:text-yellow-400 transition-colors">Source</Link>
            <Link href="/dokumentasi" className="hover:text-yellow-400 transition-colors">Infrastructure</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 ml-4">
          {/* prominent login button on desktop */}
          <Link href="/login" className="hidden sm:inline-block bg-yellow-500 text-black font-semibold px-4 py-2 rounded shadow hover:brightness-95 transition-all">Login</Link>

          {/* mobile hamburger */}
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden bg-gray-900 border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2">
            <Link href="/" className="px-3 py-2 rounded hover:bg-gray-800">Beranda</Link>
            <Link href="/team" className="px-3 py-2 rounded hover:bg-gray-800">Team & Developers</Link>
            <Link href="/roadmap" className="px-3 py-2 rounded hover:bg-gray-800">Roadmap</Link>
            <Link href="/docs" className="px-3 py-2 rounded hover:bg-gray-800">Docs</Link>
            <Link href="/sourcecode" className="px-3 py-2 rounded hover:bg-gray-800">Source</Link>
            <Link href="/dokumentasi" className="px-3 py-2 rounded hover:bg-gray-800">Infrastructure</Link>
            <div className="pt-2 border-t border-gray-800">
              <Link href="/login" className="block w-full text-center bg-yellow-500 text-black font-semibold px-4 py-2 rounded mt-2">Login</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
