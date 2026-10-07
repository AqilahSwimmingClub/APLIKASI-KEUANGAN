# Changelog

## 1.0.1 — 2026-10-07

- UI seluruh halaman mengikuti baseline visual final: header ringkas, kartu berwarna, bottom navigation dan tombol plus pada semua perangkat; sidebar permanen dihapus.
- Login dengan ilustrasi finansial 3D, identitas dua baris, card putih, metode unlock, panel keamanan dan footer gelombang biru.
- First run Buat Akun Pemilik dengan nama, konfirmasi password/PIN dan opsi biometrik nanti; tidak ada kredensial bawaan.
- Password akun, ubah password dan backup bebas selama tidak kosong; AES-GCM/PBKDF2 tetap, PIN tepat enam digit angka.
- Transaksi dikelompokkan per tanggal, filter dalam dialog/sheet, form toggle pemasukan/pengeluaran; laporan memakai tabs Ringkasan/Kategori/Tren.
- Kategori berwarna dengan jumlah transaksi; tabungan progress dan riwayat; investasi donut dan riwayat; empty state compact.
- Pengujian 21 viewport, onboarding, password fleksibel, regresi fitur dan native Android offline/Back/rotasi/persistensi.
- Android versionName 1.0.1 / versionCode 2, iOS version 1.0.1 / build 2, artifact Android menggunakan versi.

## 1.0.0

- Satu codebase React/TypeScript/Vite/Capacitor dengan vault lokal terenkripsi, transaksi, laporan, kategori, tabungan, investasi, backup/restore dan CSV/PDF.
- PIN/biometrik dengan fallback, PWA offline, Android APK, source Capacitor iOS dan GitHub Actions.
