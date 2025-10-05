import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-gray-900/70 backdrop-blur border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          SmartHome SKARIGA
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-yellow-400 transition-colors">Beranda</Link>
          <Link href="/control/esp32-s2-mini" className="hover:text-yellow-400 transition-colors">Control Panel</Link>
          <Link href="/team" className="hover:text-yellow-400 transition-colors">Team & Developers</Link>
          <Link href="/roadmap" className="hover:text-yellow-400 transition-colors">Roadmap</Link>
          <Link href="/docs" className="hover:text-yellow-400 transition-colors">Docs</Link>
          <Link href="/sourcecode" className="hover:text-yellow-400 transition-colors">Source</Link>
        </nav>
      </div>
    </header>
  );
}
