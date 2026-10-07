# Keuangan Rumah Tangga

Kelola • Rencanakan • Evaluasi Keuangan Keluarga Anda.

**Dirancang & Dikembangkan oleh FAHMI DJAWAS, S.Pd.**  
© 2026 Semua Hak Dilindungi

Aplikasi pribadi berbahasa Indonesia, mobile-first, tanpa backend. Bisa dipasang sebagai PWA, APK Android, atau aplikasi iPhone/iPad melalui proyek Capacitor iOS. Akun pertama dibuat sendiri di perangkat: tidak ada username/password produksi bawaan dan tidak ada data demo otomatis.

## Fitur

- Login lokal, password terenkripsi melalui wrapping key, PIN 6 digit, ingat saya selama tab terbuka, kunci otomatis setelah 15 menit tidak aktif; pembatasan percobaan login.
- Dashboard per bulan/tahun, saldo, ringkasan, grafik kategori/tren, perbandingan bulan, evaluasi dari data aktual.
- Transaksi CRUD dengan date picker native, pencarian, kategori, jenis, bulan/tahun, rentang tanggal dan urutan.
- Kategori pemasukan/pengeluaran custom. Kategori terpakai dilindungi.
- Target/setoran/riwayat tabungan dan aset/dana/riwayat/komposisi investasi.
- Backup JSON AES-GCM versioned, validasi relasi dan schema sebelum restore atomik; konfirmasi sebelum mengganti data aktif.
- CSV kompatibel Excel (UTF-8 BOM, separator `;`, escaping formula) dan PDF bulanan. Android menggunakan Filesystem + Share untuk menyimpan/membagikan file.
- Tema terang/gelap/perangkat, profil, target bulanan, demo opt-in Oktober 2026 dan pembersihan demo terpisah dari reset penuh.
- Header aplikasi dan bottom navigation/FAB pada semua ukuran, grid tablet tanpa sidebar, portrait dan landscape, PWA offline.

## Teknologi

React 19, TypeScript 5, Vite 7, Zod, IndexedDB melalui idb, Web Crypto AES-256-GCM/PBKDF2 SHA-256 (310.000 iterasi), SVG charts, jsPDF, vite-plugin-pwa, Capacitor 8 (Android API 24+), Vitest, Playwright dan ESLint. Node **22.12+** (direkomendasikan Node 22 LTS), JDK **21**, Android SDK **36** / build-tools **36.0.0**. Lockfile disertakan.

## Setup dan development

```sh
npm ci
npm run dev
```

Buka alamat yang dilaporkan Vite di perangkat Anda. Web Crypto membutuhkan secure context (HTTPS atau localhost). Origin/browser berbeda memiliki vault berbeda. PWA offline tersedia setelah build produksi pernah dimuat dan service worker selesai memasang cache. Tidak ada layanan jaringan yang dibutuhkan fungsi inti; instalasi dependensi/build membutuhkan akses registry.

```sh
npm run lint
npm run typecheck
npm test
npx playwright install --with-deps chromium
npm run test:e2e
npm run build
npm run preview
```

Jika Chromium sudah disediakan mesin, gunakan `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. Pengujian browser membuat akun dan transaksi dalam konteks browser terisolasi, bukan data produksi. Unit mencakup kalkulasi, tanggal, CRUD, kategori, backup/crypto dan persistensi. E2E mencakup akun, transaksi, laporan, tabungan, investasi, restore, export, PIN, tema, 21 ukuran layar wajib, rotasi form, history Back dan offline/reload.

## Baseline visual dan akun pemilik (1.0.1)

UI mengikuti gambar referensi final: ilustrasi finansial 3D yang dibundel, branding dua baris, login putih, footer gelombang biru, kartu saldo cyan/biru, KPI warna hijau/merah/biru/ungu, daftar tanggal, filter sheet, tabs laporan, target/progress, donut portfolio dan settings compact.

Instalasi pertama menampilkan **BUAT AKUN PEMILIK** dengan nama (default FAHMI DJAWAS, S.Pd.), username, password+konfirmasi, PIN+konfirmasi, dan opsi biometrik nanti. Setelah akun ada, startup menampilkan login normal atau Dashboard jika sesi valid. Akun/vault lama tetap kompatibel; tidak ada migrasi yang menghapus data atau kredensial bawaan.

Password akun, perubahan password dan backup menerima **setiap string yang tidak kosong**, tanpa batas minimal sepuluh karakter atau kewajiban kombinasi. Konfirmasi harus sama persis. PIN tetap tepat enam digit angka. AES-GCM, PBKDF2 SHA-256 310.000 iterasi, rate limiting dan penyimpanan credential terenkripsi dipertahankan. Password panjang lebih aman; peringatan tidak memblokir password pendek.

Versi web/UI/Android/iOS 1.0.1, Android versionCode 2 dan iOS build 2; lihat CHANGELOG.md. Mengedit transaksi dilakukan dengan mengetuk judul baris, menghapus melalui tombol baris dengan konfirmasi.

## Model data dan konsistensi

`Transaction` merupakan single source of truth: nominal integer Rupiah positif, `income`/`expense`, tanggal lokal `YYYY-MM-DD`, kategori, catatan dan timestamp. Timestamp audit menggunakan ISO UTC; tanggal transaksi tidak dikonversi UTC. `SavingsEntry` adalah proyeksi transaksi `allocation=savings`; riwayat aset berasal dari `allocation=investment`.

**Setoran tabungan dan pembelian investasi dihitung sebagai pengeluaran sekali saja.** Saldo bulan adalah pemasukan dikurangi seluruh pengeluaran; kartu tabungan/investasi adalah rincian alokasi, bukan pengurangan tambahan. Saldo tersebut merupakan arus kas bersih bulan, bukan total kekayaan. Total tabungan/portfolio adalah akumulasi modal dari transaksi, **bukan nilai pasar**. Edit/hapus setoran dilakukan melalui transaksi atau riwayat dan memperbarui semua halaman. Target/aset dengan transaksi tidak dapat dihapus sebelum transaksi dipindahkan/dihapus. Pengembalian dana dapat dicatat sebagai pemasukan biasa dengan catatan; pencatatan penarikan/kinerja pasar otomatis belum disediakan.

## Keamanan dan backup

Vault tersimpan terenkripsi di IndexedDB. Kunci acak AES dibungkus dengan kunci turunan password dan, jika dipilih, PIN. Password/PIN tidak disimpan plaintext. PIN lebih lemah dari password karena hanya satu juta kombinasi; pembatasan percobaan berlaku pada aplikasi dan bukan perlindungan terhadap ekstraksi penyimpanan oleh penyerang perangkat. Gunakan password kuat dan keamanan perangkat.

WebAuthn platform authenticator dengan **PRF** tersedia melalui Pengaturan → Keamanan Akun. Vault hanya dibuka dengan verifikasi perangkat dan kunci PRF, bukan sekadar hasil fingerprint boolean. Browser/WebView tanpa PRF (termasuk banyak Android WebView) menggunakan fallback password/PIN. Integrasi biometrik native ke keystore dapat dikembangkan melalui adapter keamanan; tidak ada plugin yang berpura-pura membuka vault tanpa kunci.

Ingat saya menyimpan kunci sesi di **sessionStorage**, hanya selama tab hidup dan maksimal 15 menit saat reload; keluar menghapusnya. Kunci aktif hanya berada di memori tanpa ingat saya. Aplikasi mengunci setelah 15 menit tidak aktif. Perangkat yang sudah terbuka dan skrip pada origin yang sama tetap termasuk trust boundary. Jangan menjalankan aplikasi dari origin tidak terpercaya. Android OS backup dinonaktifkan; backup manual terenkripsi tetap tersedia.

Backup mencakup transaksi, seluruh kategori, target, aset dan preferensi, tanpa kredensial akun. Vault dibatasi 12 MiB data UTF-8 sebelum enkripsi, sehingga semua backup yang dihasilkan dapat dipulihkan di bawah batas file restore 22 MB. Penulisan yang melewati batas ditolak sebelum menyentuh data aktif. Pilih password backup tidak kosong, unduh file, simpan di lokasi aman. Restore: pilih file, isi password backup yang sama, validasi, lalu konfirmasi. Backup rusak/password salah/relasi invalid ditolak sebelum mengganti data. Restore di perangkat baru dilakukan setelah membuat akun lokal baru. Tidak ada pemulihan password melalui server. Jika password dan PIN terlupa, hanya backup dengan password yang diketahui yang dapat memulihkan data setelah penyimpanan akun dibersihkan. Browser dapat menghapus data saat clear storage/uninstall/incognito; minta persistensi lewat pengaturan dan backup berkala.

## Android

Install Android Studio atau command-line SDK resmi; set `JAVA_HOME` ke JDK 21 dan `ANDROID_HOME`/`ANDROID_SDK_ROOT` ke SDK.

```sh
sdkmanager 'platforms;android-36' 'build-tools;36.0.0' 'platform-tools'
npm run android:sync
cd android
./gradlew --no-daemon --max-workers=2 assembleDebug
```

Atau `npm run android:build`. Windows menggunakan `gradlew.bat`. APK lokal: `android/app/build/outputs/apk/debug/app-debug.apk`. Install pada perangkat lewat `adb install -r .../app-debug.apk`. Package ID: `id.fahmidjawas.keuanganrumah`. Debug APK ditandatangani debug key standar dan bisa diuji tanpa secret. Release/distribusi Play Store membutuhkan keystore milik pemilik aplikasi; jangan commit keystore/password.

Web assets native dihasilkan oleh `cap sync`, tidak di-commit. File ekspor Android dibuat di cache privat lalu dialog Share membuka pilihan penyimpanan pengguna. File backup yang dipilih melalui file picker dibaca lokal. Perlu uji perangkat nyata untuk perilaku file picker/share/biometrik dan berbagai versi WebView; build APK tidak membuktikan seluruh perilaku native.

## iPhone dan iPad

Source iOS menggunakan Capacitor 8.5.2 dan Swift Package Manager, deployment target iOS 15+, keluarga perangkat iPhone/iPad, portrait dan landscape. Icon 1024×1024 tanpa transparansi dan splash orisinal disertakan. Penyiapan dan `cap sync ios` dapat dilakukan di Linux; kompilasi native membutuhkan **macOS + Xcode 26+**.

```sh
npm ci
npm run ios:sync
npm run ios:open
```

Pada tahap macOS, Xcode memulihkan paket SPM, lalu build/run pada simulator atau perangkat dan mengatur Signing & Capabilities untuk distribusi. Build simulator, validasi runtime iOS, signing dan IPA belum dilakukan di lingkungan Linux ini. Tidak diperlukan kredensial Apple untuk menyiapkan source sekarang.

## Layout, safe area dan navigasi native

Compact <600px memakai konten satu kolom dan KPI 2×2; medium 600–839px dan expanded ≥840px memakai grid yang mengikuti ruang. Bottom navigation tetap pada semua ukuran, tanpa sidebar permanen. Landscape dengan tinggi ≤500px memakai susunan lebar dengan scrolling. Login mempertahankan ilustrasi finansial, identitas, card putih, metode login, panel keamanan dan footer. Ikon tabungan memakai dompet/koin.

Safe area keempat sisi memakai `env(safe-area-inset-*)` untuk iOS dan variabel insets SystemBars Capacitor untuk Android. Keyboard native meresize viewport; dialog dapat scroll, input nominal memakai numeric keyboard, navigasi bawah disembunyikan ketika IME terbuka. Rotasi tidak mengganti state form. Android Back menutup dialog, kembali ke halaman sebelumnya, lalu meminimalkan aplikasi di Dashboard.

Production tidak mengatur `server.url`. `cap sync` menyalin bundle lokal ke Android/iOS. Origin `https://localhost` yang ditampilkan oleh internal WebView adalah origin virtual Capacitor untuk aset APK, bukan koneksi ke dev server atau komputer. APK dapat membuka login dan fungsi inti dalam mode pesawat.

## GitHub Actions

- `.github/workflows/ci.yml`: push main, pull request, manual `workflow_dispatch`; npm ci, lint, typecheck, unit, E2E, build; artifact **keuangan-rumah-tangga-web-v1.0.1**.
- `.github/workflows/android.yml`: push main/manual; Java 21, Node 22, SDK 36, build web, Capacitor sync, Gradle debug APK dan emulator API 35 untuk instalasi, startup offline, rotasi, hardware Back dan persistensi setelah Activity/WebView dibuat ulang; artifact **keuangan-rumah-tangga-android-v1.0.1** berisi `app-debug.apk`.

Actions → Android Debug APK → run → Artifacts. Tidak membutuhkan secret untuk debug. Workflow beroperasi dengan `contents: read`. Signing release belum dikonfigurasi.

## Struktur

```text
src/core/          schema, ledger, enkripsi, IndexedDB, ekspor native
src/components/    dialog, date/month forms, chart SVG, transaksi
src/pages/         login, dashboard/laporan, transaksi, aset, pengaturan
src/App.tsx        sesi, navigasi, koordinasi penyimpanan dan konfirmasi
src/styles.css     responsif dan tema
public/            ikon orisinal
android/           proyek native Capacitor dan Gradle wrapper terverifikasi
ios/               source Xcode/SPM, orientasi, icon dan splash iPhone/iPad
.github/workflows/ CI web dan APK
tests/             unit dan E2E
docs/              permintaan asli, desain dan rencana
```

## Mengembangkan penyimpanan

Model/schema dan perhitungan murni terpisah dari adapter vault. Backend/database masa depan dapat mengganti fungsi `loadAccount/readData/saveData` tanpa mengulang perhitungan domain. Penulisan data dienkripsi sebelum satu operasi IndexedDB atomik; React hanya mengubah state setelah penulisan berhasil. Penulisan memeriksa versi ciphertext dalam transaksi IndexedDB: tab lama ditolak bila tab lain sudah mengubah data. Muat ulang dan masuk kembali sebelum mengedit ketika pesan konflik muncul.
