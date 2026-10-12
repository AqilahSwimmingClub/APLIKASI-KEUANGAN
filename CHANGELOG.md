# Changelog

## 1.0.4 — 2026-10-12

- Nama tampilan produk menjadi A-Zuha Finance pada web, PWA, Android, iOS, dan laporan; package/bundle ID serta format vault tetap.
- Android `versionCode` 5 dan iOS build 5. Login portrait lebih padat dan ring fokus input wrapper dibersihkan.
- Android BiometricPrompt dengan kunci Android Keystore dan iOS Keychain dengan perlindungan biometrik membuka kunci vault setelah pendaftaran. Password/PIN tetap tersedia.
- Workflow publikasi menuntut APK release bertanda tangan dan tidak menerbitkan APK debug sebagai update resmi. Asset logo resmi dan kunci signing lama masih diperlukan sebelum distribusi final.

## 1.0.3 — 2026-10-12

- Setoran Tabungan langsung tersedia dari tombol utama halaman Tabungan dan FAB; formulir khusus memakai tanggal, target, nominal, dan catatan.
- Tabungan Umum dibuat otomatis dengan ID tetap pada akun baru dan vault lama, tanpa menghapus target lama; setoran, edit, hapus, progress, dan riwayat berasal dari transaksi yang sama.
- KPI Pengeluaran kini hanya pengeluaran reguler; Tabungan dan Investasi dihitung sebagai alokasi tersendiri. Saldo mengurangi keempat arus dana satu kali.
- Dashboard menampilkan setoran bulan terpilih, sedangkan halaman Tabungan dan portfolio Investasi menampilkan akumulasi seluruh bulan; laporan, kategori, perbandingan, evaluasi dan ekspor mengikuti model baru.
- Uji regresi mencakup pemasukan Rp 900.000, setoran Rp 200.000, reload/login, edit Rp 250.000, hapus, lintas bulan, dan persistensi Android setelah Activity dibuat ulang.
- Android versionName 1.0.3/versionCode 4, iOS MARKETING_VERSION 1.0.3/build 4; workflow iOS menyimpan aplikasi simulator unsigned sebagai artifact.

## 1.0.2 — 2026-10-07

- Branding FINORA / Keuangan Keluarga pada web, PWA, Android, iOS, splash, laporan dan Tentang Aplikasi; package/bundle ID tetap.
- Field input membulat dengan border lembut, ikon, caret biru, dan focus ring pada wrapper; garis biru vertikal terpotong pada password hilang.
- Login landscape tablet dua kolom terpusat; dashboard tablet lebih padat dengan pasangan grafik, evaluasi, transaksi dan target; bottom navigation tablet dibatasi lebar.
- Workflow iOS baru memvalidasi build simulator unsigned di macOS; panduan TestFlight serta development/ad hoc dan prasyarat IPA disediakan.
- Workflow Android membangun APK debug bernama versi dan menyiapkan APK release bertanda tangan tetap jika empat GitHub Secrets tersedia; keystore tidak disimpan di repo.
- Versi Android 1.0.2/code 3, iOS 1.0.2/build 3; aturan password tidak kosong dan PIN enam digit dipertahankan.

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
