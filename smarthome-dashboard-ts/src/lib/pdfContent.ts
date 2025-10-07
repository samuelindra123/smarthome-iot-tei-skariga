// Structured documentation content for PDF generation.
// Enough material will be programmatically expanded to reach ~75 pages.

export interface DocSection {
  id: string;
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
  code?: string;
  table?: { headers: string[]; rows: string[][] };
}

// Base sections (core). We will replicate / expand to reach desired length in API route.
export const baseSections: DocSection[] = [
  {
    id: 'cover',
    title: 'Laporan Sistem Smart Home IoT',
    paragraphs: [
      'Dokumen ini merupakan kompilasi dokumentasi teknis dan arsitektur untuk proyek Smart Home IoT yang terintegrasi dengan dashboard Next.js dan perangkat ESP32-S2 Mini.',
      'Penyusun: Samuel Indra Bastian',
      'Kelas: XI EIA',
      'Sekolah: SMK PGRI 3 Malang',
      'Tanggal Pembuatan: (otomatis saat generate)' 
    ]
  },
  {
    id: 'pendahuluan',
    title: 'Pendahuluan',
    paragraphs: [
      'Smart Home IoT ini dibangun untuk mendemonstrasikan integrasi antara perangkat embedded (ESP32-S2 Mini) dan antarmuka web modern.',
      'Tujuan utama: kontrol relay secara real-time, pemantauan status perangkat, logging broker MQTT, serta dokumentasi arsitektur lengkap.',
      'Sistem menggunakan protokol MQTT di atas WebSocket untuk kompatibilitas browser dan efisiensi komunikasi.'
    ],
    bulletPoints: [
      'Kontrol perangkat (4 channel relay)',
      'Monitoring presence dan status',
      'Broker metrics & logging ( $SYS dan aplikasi )',
      'Integrity & latency check',
      'Dokumentasi otomatis -> PDF'
    ]
  },
  {
    id: 'arsitektur',
    title: 'Arsitektur Sistem',
    paragraphs: [
      'Arsitektur terdiri dari beberapa lapisan: Perangkat (ESP32), Broker MQTT (Mosquitto), Reverse Proxy (opsional, TLS), dan Dashboard (Next.js).',
      'Komunikasi utama: perangkat publish status dan presence, dashboard subscribe & mengontrol via topik perintah.',
      'Presence menggunakan kombinasi retained online, LWT offline, dan heartbeat periodik.'
    ],
    bulletPoints: [
      'ESP32-S2 Mini: Firmware C++/Arduino + PubSubClient',
      'Broker: Mosquitto dengan topik aplikasi smarthome/#',
      'Frontend: Next.js App Router + React 19',
      'UI Realtime: mqtt.js over WSS',
      'Keamanan (tahap lanjut): autentikasi, TLS'
    ]
  },
  {
    id: 'topik-mqtt',
    title: 'Struktur Topik MQTT',
    paragraphs: [
      'Berikut struktur topik utama yang digunakan dalam sistem. Penamaan mengikuti pola konsisten untuk memudahkan parsing di sisi frontend.',
      'Presence dan status dipisahkan untuk kejelasan dan ketahanan terhadap kondisi crash/power cut.'
    ],
    table: {
      headers: ['Topik', 'Deskripsi', 'Retained', 'Contoh Payload'],
      rows: [
        ['smarthome/{channel}/perintah', 'Perintah ON/OFF untuk channel', 'Tidak', 'ON'],
        ['smarthome/{channel}/status', 'Status terakhir channel', 'Ya', 'OFF'],
        ['smarthome/device/esp32s2mini/presence', 'Presence + heartbeat', 'online/offline retained', 'online'],
        ['smarthome/device/ping', 'Permintaan ping latency', 'Tidak', '{"id":123}'],
        ['smarthome/device/ping/echo', 'Balasan ping', 'Tidak', '{"id":123}'],
        ['$SYS/#', 'Topik sistem broker', 'N/A', 'variasi']
      ]
    }
  },
  {
    id: 'presence',
    title: 'Mekanisme Presence',
    paragraphs: [
      'Presence diimplementasikan dengan tiga komponen: retained online saat connect, LWT retained offline saat koneksi terputus tak normal, dan heartbeat periodik non-retained.',
      'Frontend mengkategorikan payload yang bukan online/offline sebagai heartbeat dan memperbarui timestamp lastSeen.',
      'Timeout presence ditetapkan 3x interval heartbeat (default 30s) sebelum menandai offline karena sunyi.'
    ],
    bulletPoints: [
      'Retained awal -> cepat sinkron',
      'LWT -> deteksi power loss instan',
      'Heartbeat -> jaga lastSeen tetap segar',
      'Timeout -> fallback offline',
      'UI disable kontrol saat offline'
    ]
  },
  {
    id: 'kontrol',
    title: 'Alur Kontrol Relay',
    paragraphs: [
      'Dashboard mengirim perintah ke topik perintah. Firmware menerima, mengubah state GPIO relay, kemudian mem-publish status channel retained.',
      'Hanya perubahan status yang dipublish (deduplikasi) untuk menekan traffic.'
    ],
    code: "// Pseudocode\nif (incomingTopic == 'smarthome/lampu1/perintah') {\n  setRelay(lampu1, payload == 'ON');\n  publishStatusRetained(lampu1);\n}"
  },
  {
    id: 'ui-dashboard',
    title: 'Fitur UI Dashboard',
    paragraphs: [
      'Dashboard menyediakan beberapa halaman: landing, control panel, monitor presence, broker metrics, dokumentasi, dan source code.',
      'Visualisasi realtime memakai kombinasi React state + canvas untuk chart besar + SVG sparkline ringan.'
    ],
    bulletPoints: [
      'Control: ON/OFF + simulasi status',
      'Monitor: presence + ping + snapshot JSON',
      'Metrics: $SYS sampling, sparkline, delta & integrity hash',
      'Docs: TOC, anchor links, print styles',
      'Source: repositori & struktur proyek'
    ]
  },
  {
    id: 'integritas',
    title: 'Pemeriksaan Integritas Pesan',
    paragraphs: [
      'UI menghitung rolling hash sederhana dari urutan payload untuk mendeteksi anomali (misal loncatan sequence).',
      'Mekanisme ini dapat diperluas menjadi HMAC atau signature jika keamanan ditingkatkan.'
    ]
  },
  {
    id: 'pengujian',
    title: 'Pengujian & Validasi',
    paragraphs: [
      'Pengujian meliputi: koneksi broker, latensi ping, konsistensi retained, recover setelah putus, dan validasi offline otomatis setelah power cut.',
      'Skenario edge case mencakup: koneksi broker gagal, WiFi drop, device hang, dan duplicate command.'
    ]
  },
  {
    id: 'keamanan',
    title: 'Keamanan (Roadmap)',
    paragraphs: [
      'Tahap berikut mencakup aktivasi autentikasi Mosquitto, enkripsi TLS penuh untuk device, rate limiting per IP, dan audit log.',
      'Rencana jangka panjang: isolasi VLAN IoT dan integrasi IDS ringan.'
    ]
  },
  {
    id: 'lampiran',
    title: 'Lampiran Contoh Konfigurasi',
    code: "# mosquitto.conf minimal\nlistener 1883\nallow_anonymous true\n# listener 9001\n# protocol websockets\n",
    paragraphs: [
      'Lampiran berisi contoh konfigurasi minimal dan dapat diperluas dengan TLS, password_file, dan plugin tambahan.'
    ]
  }
];
