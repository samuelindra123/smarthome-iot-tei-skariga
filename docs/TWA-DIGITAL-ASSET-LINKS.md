# 🔐 Panduan Verifikasi Digital Asset Links untuk TWA

## 📋 Ringkasan Informasi

**Website:** https://tecnoverse.app  
**Package Name:** `com.tecnoverse.smarhome`  
**SHA256 Fingerprint:** `B2:A8:91:BB:C5:9D:6F:46:CE:DC:D0:A3:E6:4B:A3:83:17:DB:78:EB:8C:B4:FB:DB:B9:35:CC:63:25:DE:F1:F6`

---

## 📁 Langkah 4: Upload File assetlinks.json

### Lokasi Upload yang BENAR:

File `assetlinks.json` harus dapat diakses di URL:

```
https://tecnoverse.app/.well-known/assetlinks.json
```

### Di Next.js Project (yang Anda gunakan):

File sudah saya buatkan di:
```
public/.well-known/assetlinks.json
```

**Next.js akan otomatis melayani file ini** di URL yang benar ketika Anda deploy.

---

## 🚀 Cara Deploy ke Production

### 1. Commit dan Push ke Git

```bash
cd /workspaces/smarthome-iot-tei-skariga/smarthome-iot-tei-skariga/smarthome-dashboard-ts

git add public/.well-known/assetlinks.json
git commit -m "Add Digital Asset Links for TWA verification"
git push origin main
```

### 2. Deploy ke Vercel (atau hosting Anda)

Setelah push, Vercel akan otomatis deploy. File akan tersedia di:
```
https://tecnoverse.app/.well-known/assetlinks.json
```

---

## ✅ Cara Verifikasi Bahwa Upload Berhasil

### Opsi 1: Menggunakan Browser
Buka URL ini di browser:
```
https://tecnoverse.app/.well-known/assetlinks.json
```

Anda harus melihat konten JSON yang benar.

### Opsi 2: Menggunakan curl (Terminal)
```bash
curl https://tecnoverse.app/.well-known/assetlinks.json
```

### Opsi 3: Google's Statement List Generator and Tester
Kunjungi:
```
https://developers.google.com/digital-asset-links/tools/generator
```

Masukkan:
- **Hosting site domain:** `tecnoverse.app`
- **App package name:** `com.tecnoverse.smarhome`
- **App package fingerprint (SHA256):** `B2:A8:91:BB:C5:9D:6F:46:CE:DC:D0:A3:E6:4B:A3:83:17:DB:78:EB:8C:B4:FB:DB:B9:35:CC:63:25:DE:F1:F6`

Klik **Test statement** untuk verifikasi.

---

## 📱 Testing di Android Device

### 1. Uninstall APK Lama
```bash
adb uninstall com.tecnoverse.smarhome
```

### 2. Install APK Baru
```bash
adb install -r /path/to/app-debug.apk
```

### 3. Clear Chrome Data (Penting!)
Di device Android:
1. Settings → Apps → Chrome
2. Storage → Clear Storage
3. Restart Chrome

### 4. Buka Aplikasi TWA

**URL bar seharusnya HILANG** setelah beberapa detik.

---

## 🔍 Troubleshooting

### Problem: URL bar masih muncul

**Kemungkinan penyebab:**

1. **Cache Chrome belum clear**
   - Clear Chrome storage (lihat di atas)
   - Restart device

2. **File assetlinks.json belum accessible**
   - Test dengan `curl https://tecnoverse.app/.well-known/assetlinks.json`
   - Pastikan return HTTP 200 OK
   - Content-Type harus `application/json`

3. **Typo di package name atau fingerprint**
   - Double-check file assetlinks.json
   - Pastikan tidak ada spasi ekstra

4. **DNS belum propagate**
   - Tunggu 5-15 menit setelah deploy
   - Coba force refresh browser (Ctrl+Shift+R)

5. **HTTPS tidak aktif**
   - Digital Asset Links HANYA bekerja dengan HTTPS
   - Pastikan `https://tecnoverse.app` accessible

---

## 📝 Catatan Penting

### Untuk Production Release:

Ketika Anda membuat **signed release APK** untuk Play Store, Anda perlu:

1. Generate **release keystore** baru (bukan debug)
2. Dapatkan SHA256 dari release keystore
3. **Tambahkan** fingerprint baru ke array `sha256_cert_fingerprints` di `assetlinks.json`:

```json
{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.tecnoverse.smarhome",
    "sha256_cert_fingerprints": [
      "B2:A8:91:BB:C5:9D:6F:46:CE:DC:D0:A3:E6:4B:A3:83:17:DB:78:EB:8C:B4:FB:DB:B9:35:CC:63:25:DE:F1:F6",
      "XX:XX:XX:... (release fingerprint)"
    ]
  }
}
```

**JANGAN HAPUS debug fingerprint** - Anda masih butuh untuk testing!

---

## 🎯 Checklist Final

- [ ] File `assetlinks.json` ada di `public/.well-known/`
- [ ] Commit dan push ke Git
- [ ] Deploy ke production (Vercel auto-deploy)
- [ ] Verifikasi file accessible: `curl https://tecnoverse.app/.well-known/assetlinks.json`
- [ ] Uninstall APK lama dari device
- [ ] Clear Chrome storage
- [ ] Install APK baru
- [ ] Buka app - URL bar harus hilang!

---

## 📚 Referensi

- [Verify Android App Links](https://developer.android.com/training/app-links/verify-android-applinks)
- [Digital Asset Links](https://developers.google.com/digital-asset-links)
- [TWA Quick Start Guide](https://developer.chrome.com/docs/android/trusted-web-activity/quick-start/)

---

**Good luck! 🚀**
