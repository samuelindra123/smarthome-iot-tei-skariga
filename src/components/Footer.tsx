export default function Footer() {
  return (
    <footer className="mt-24 w-full border-t border-gray-800 bg-gray-950/70 backdrop-blur py-10 text-sm">
      <div className="max-w-6xl mx-auto px-6 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-semibold mb-2">SmartHome SKARIGA</h3>
          <p className="text-gray-400 leading-relaxed">Proyek IoT pembelajaran mengendalikan 4-CH relay (2 lampu & 2 stopkontak AC) menggunakan ESP32-S2 Mini dan dashboard web realtime MQTT.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Teknologi</h3>
          <ul className="space-y-1 text-gray-400">
            <li>ESP32-S2 Mini</li>
            <li>MQTT (WebSocket)</li>
            <li>Next.js 14 & TypeScript</li>
            <li>Tailwind CSS</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Credits</h3>
          <p className="text-gray-400 leading-relaxed">Sekolah: SMK PGRI 3 MALANG <br /> SKARIGA .</p>
        </div>
      </div>
      <div className="mt-10 text-center text-gray-600">&copy; {new Date().getFullYear()} SmartHome SKARIGA. All rights reserved.</div>
    </footer>
  );
}
