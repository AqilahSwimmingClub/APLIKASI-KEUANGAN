# Keuangan Rumah Tangga
Spesifikasi lengkap: ../../permintaan.txt. Seluruh 25 bagian wajib dipenuhi.

## Arsitektur
React/TypeScript/Vite mobile-first, tanpa backend. Repository hanya APLIKASI-KEUANGAN. IndexedDB melalui idb menyimpan satu vault AES-GCM; kunci PBKDF2 berasal dari password. PIN membungkus kunci vault, dengan pembatasan percobaan. Session ingat saya terbatas pada tab melalui sessionStorage. WebAuthn PRF dapat membuka vault pada perangkat mendukung; tanpa PRF tetap password/PIN. Password tidak disimpan plaintext. Backup terenkripsi portable dengan password backup, validasi Zod versioned dan commit atomik setelah konfirmasi.

## Buku transaksi
Semua nominal integer Rupiah positif. Date berupa YYYY-MM-DD lokal, tanpa konversi UTC. Jenis income/expense. Transaksi biasa dan alokasi savings/investment berbagi ledger; alokasi termasuk pengeluaran tepat sekali dan memiliki goalId/investmentId. Setoran/riwayat merupakan proyeksi ledger, bukan nominal ganda. Hapus target/aset hanya jika tanpa transaksi tertaut. Kategori terpakai tidak dapat dihapus. Perubahan transaksi memperbarui semua proyeksi.

## Antarmuka
Bahasa Indonesia, putih/navy/biru, hijau/merah/ungu, sidebar desktop dan bottom nav mobile dengan FAB. Dashboard, transaksi/filter/CRUD, laporan/grafik/evaluasi, tabungan, investasi dan pengaturan. Login pembuatan akun pertama, footer identitas persis permintaan. Chart SVG ringan. Empty/loading/error, dialog konfirmasi. Native date input. CSV aman formula dan PDF jsPDF. Tema terang/gelap/system. Data demo opt-in dan reset terpisah.

## Distribusi dan validasi
PWA precache offline dengan vite-plugin-pwa, icon orisinal. Capacitor Android id id.fahmidjawas.keuanganrumah. CI Node 22, Java 21, Android SDK, debug APK artifact. Unit domain/security/storage/backup dan Playwright alur pengguna/responsive/offline, lint/typecheck/build. Commit/push main dan Actions jika akses tersedia. Android lokal dicoba; batas jaringan/toolchain dilaporkan berdasarkan bukti.
