# Revisi baseline visual final — 2026-10-07

Authority: permintaan.txt dan gambar referensi pada percakapan. User menginstruksikan eksekusi langsung, tanpa approval desain tambahan. Checkout cloud sudah terisolasi; tetap repository/stack yang sama. Versi 1.0.1, Android build 2, iOS build 2. Tidak ada schema migration/destructive reset.

1. Auth: tulis tes red untuk semua password contoh, kosong, PIN; ubah validasi nonempty tanpa mengurangi AES/PBKDF2. First-run halaman Buat Akun Pemilik dengan Nama, Username, password+konfirmasi, PIN+konfirmasi, biometrik nanti. Login normal hanya untuk akun existing. Pertahankan akses vault lama. Ubah password dan backup aturan sama.
2. Shell: header ringkas, bottom nav semua breakpoint tanpa sidebar, shortcut Kategori/Tabungan/Investasi, safe area/keyboard/Back tetap. Buat Kategori halaman dedicated dengan komponen manajemen existing.
3. Halaman: kartu saldo gradient cyan-blue, KPI colorful 2x2/4cols, grid chart compact; laporan tabs ringkasan/kategori/tren dan export compact. Transaksi tabs+search+filter sheet, grouped rows. Form toggleincome/expense. Tabungan target/progress/history dan investasi donut. Settings compact colored rows. Login branding mengikuti referensi, titlecase2lines, waves footer, financial wallet illustration.
4. Validasi: update helper first-run, suite 21 viewport spesifikasi (data nyata/chart/form/rotation/nav), auth/error tests, regresi CRUD/offline/export; screenshot review phone/tablet. Unit/lint/TS/web build, cap sync Android/iOS, APK aapt/apksigner, emulator instrumentation.
5. Integrasi: bump semua versi+CHANGELOG+artifact versioned; reviewer fresh-context; commit/push main; Actions sampai green; simpan config cloud final SHA.

Interfaces: Task1 changes signup UI consumed by E2E/native instrumentation; update helpers/test native same task. Task2 removes sidebar expected by old responsive tests; replace with always bottom nav, retain page h1 selectors. Task3 preserves ledger callbacks and accessible form names/CRUD.
