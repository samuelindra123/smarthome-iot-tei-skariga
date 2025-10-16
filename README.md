# Dokumentasi Proyek — smarthome-dashboard-ts (SmartHome SKARIGA)

Dokumentasi ini menjelaskan arsitektur, fitur, struktur kode, alur autentikasi, API backend, integrasi MQTT, pengaturan environment, dan pedoman debugging untuk proyek dashboard SmartHome SKARIGA. Dokumen ini bukan panduan instalasi — fokus pada apa yang ada dan bagaimana komponennya bekerja.

1) Ringkasan arsitektur
------------------------
- Frontend: Next.js (App Router, TypeScript). UI modern, responsive, dibagi ke area publik, dashboard pengguna biasa (`/dashboard`) dan admin (`/admin`).
- Auth & Database: Appwrite (cloud) — digunakan untuk otentikasi (account.sessions), manajemen user, dan penyimpanan dokumen pengguna.
- Real-time device comms: MQTT over WebSocket (mqtt.js) — browser berlangganan topik broker untuk status/hadir dan menerbitkan perintah ke perangkat.
- Server-side API routes (Next.js app/api/*): beberapa route menggunakan Appwrite server SDK dan APPWRITE_API_KEY untuk membuat/ubah dokumen pengguna.

2) Fitur utama
----------------
- Autentikasi user (email/password) via Appwrite.
- Dashboard pengguna: halaman selamat datang, control panel terproteksi, halaman voice control (speech-to-text), dan monitoring broker.
- Admin dashboard: mengelola pengguna, melihat daftar user, buka modal profil user, ubah peran.
- MQTT provider: menghubungkan ke broker WebSocket, buffer publish/subscribe saat offline, queue publikasi saat belum connected.
- Proteksi route: `AuthGuard` pada client untuk bagian kontrol, middleware minimal di server (dev-mode safe).

3) Struktur direktori (penting)
--------------------------------
- `src/app/` — semua route Next.js (App Router). Struktur penting:
  - `app/layout.tsx` — root layout, membungkus `AuthProvider` dan `MqttProvider`.
  - `app/dashboard/*` — halaman dashboard pengguna.
  - `app/admin/*` — admin area (manajemen pengguna).
  - `app/control/esp32-s2-mini/*` — control panel, metrics, monitor, voice.
  - `app/api/*` — API route serverless (mis. `/api/users/create`, `/api/users/update`).
- `src/components/` — UI re-usable (Header, Footer, GlobalChrome, DashboardHeader, AuthGuard, UserProfileModal, dll).
- `src/context/AuthContext.tsx` — manajemen sesi, login/logout, checkSession, integrasi Appwrite client.
- `src/lib/appwrite.ts` — inisialisasi Appwrite SDK client.
- `src/lib/mqtt.tsx` — provider MQTT (koneksi, fallback wss→ws sekali, antrian subscribe/publish).

4) Environment variables (penting)
----------------------------------
Letakkan konfigurasi pada `.env.local` (tidak di-commit). Variabel yang dipakai:
- NEXT_PUBLIC_APPWRITE_PROJECT_ID — Project ID Appwrite (publik)
- NEXT_PUBLIC_APPWRITE_ENDPOINT — Endpoint Appwrite (umumnya: https://<region>.cloud.appwrite.io/v1)
- NEXT_PUBLIC_APPWRITE_DATABASE_ID — database id
- NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID — collection id untuk documents user
- APPWRITE_API_KEY — API key rahasia untuk route server (harus disimpan aman)
- NEXT_PUBLIC_MQTT_BROKER_URL — URL broker WebSocket, contoh `wss://mqtt.example.com:8081` (opsional)

Catatan keamanan: Jangan letakkan `APPWRITE_API_KEY` di client. Variabel yang dimulai `NEXT_PUBLIC_` dibundel ke browser.

5) Alur autentikasi dan sesi
-----------------------------
- Client memanggil `account.createEmailPasswordSession(email, password)` menggunakan Appwrite client untuk membuat session.
- `AuthContext` memanggil `account.get()` untuk memeriksa session aktif dan memuat dokumen pengguna dari database untuk menambahkan atribut `role`.
- Logout memanggil `account.deleteSession('current')` (server API Appwrite) dan mengosongkan context.
- Implementasi menangani kasus `user_session_already_exists` (Appwrite 401) dengan cek session atau hapus lalu recreate — menghindari kondisi di mana cookie session sudah ada.

6) API server-side (ringkasan)
--------------------------------
- `app/api/users/create/route.ts` (POST): membuat akun user via Appwrite server SDK dan menambahkan dokumen role di koleksi users.
- `app/api/users/update/route.ts` (PUT): memperbarui dokumen user (nama, role) menggunakan APPWRITE_API_KEY.

Catatan: Endpoint ini harus diproteksi di level infrastruktur (mis. firewall, JWT, atau Appwrite Functions) jika dipublikasikan. Saat ini, route memerlukan APPWRITE_API_KEY sehingga hanya server dapat memanggilnya.

7) MQTT & Realtime
--------------------
- Provider MQTT (`src/lib/mqtt.tsx`) bertanggung jawab:
  - Membuka koneksi ke `NEXT_PUBLIC_MQTT_BROKER_URL`.
  - Menjaga antrian publish saat disconnected.
  - Queue subscribe yang diminta sebelum koneksi selesai.
  - Mencatat status `connected`/`reconnecting` untuk UI.
- Perangkat ESP32 mempublikasikan presence dan menerima perintah di topik yang sudah disepakati (mis. `smarthome/<deviceId>/perintah`).

8) Keamanan & best-practices
------------------------------
- JANGAN commit `.env.local` atau `APPWRITE_API_KEY` ke Git.
- Pastikan origin yang diizinkan pada Appwrite (CORS) mencakup host dev (`http://localhost:3000`) dan host produksi. Jika Anda memakai 127.0.0.1, tambahkan juga.
- Validasi dan otorisasi server-side: route yang mengubah role atau membuat user harus dijaga ketat. Gunakan Appwrite Functions atau middleware server yang memeriksa header/keystoken.

9) Debugging cepat
------------------
- Appwrite login issues:
  - Periksa `NEXT_PUBLIC_APPWRITE_ENDPOINT` dan `NEXT_PUBLIC_APPWRITE_PROJECT_ID`.
  - Periksa allowed origins di Appwrite console (localhost vs 127.0.0.1).
  - Jika Appwrite merespons `user_session_already_exists`, cek cookie session browser atau gunakan `account.get()`.
- MQTT issues:
  - Jika WebSocket gagal (`wss://... failed`), cek:
    - Broker reachable dari host (openssl s_client atau wscat), sertifikat TLS valid, port dibuka.
    - Untuk dev, kosongkan `NEXT_PUBLIC_MQTT_BROKER_URL` agar provider tidak terkonek.
- Dev server port conflict: jika dev server fallback ke 3001, hentikan proses yang mendengarkan 3000 (lsof / ss / kill) atau jalankan `PORT=3001 npm run dev`.

10) Kode & tata laksana testing
--------------------------------
- Linting/TypeScript: proyek sudah mengaktifkan aturan lint ketat. Perbaiki `any` dan dependency React hook warnings saat menambahkan kode baru.
- Unit tests: saat ini tidak ada suite test. Disarankan menambahkan minimal unit tests untuk util `parseCommand` dan beberapa komponen kritis (Auth flow, API mock).

11) Next steps & area perbaikan
--------------------------------
- Harden server-side authorization: tambahkan middleware/cek server-side pada route sensitif.
- Tambahkan audit logging saat role diubah.
- Pilih strategi deploy broker (managed MQTT atau gunakan reverse-proxy TLS) agar wss selalu tersedia.
- Tambah test end-to-end login + protected routes.

Jika butuh, saya bisa membuat dokumen terpisah untuk:
- Konfigurasi Appwrite (detail console settings),
- Panduan produksi (reverse-proxy TLS, environment, security),
- Spesifikasi topik MQTT dan skema payload untuk firmware ESP32.
