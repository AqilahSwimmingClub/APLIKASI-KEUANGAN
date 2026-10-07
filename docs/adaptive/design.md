# Perbaikan adaptive dan native
Spec: permintaan.txt, seluruh fitur finansial yang sudah lulus dipertahankan.

Satu codebase React/TypeScript/Vite/Capacitor, ledger dan vault tidak dirombak. Compact <600, medium 600–839, expanded >=840; expanded dengan tinggi <=500 tetap memakai bottom navigation untuk phone landscape. Form satu kolom compact, dua kolom jika lebar cukup; grid dashboard tablet. Semua sisi menggunakan safe-area variables, viewport/keyboard menyesuaikan tinggi efektif.

Login memakai ilustrasi finansial dompet/koin/rumah/grafik di atas logo dan judul, form putih rounded, remember/forgot, tiga metode autentikasi dengan fallback yang nyata, panel data aman, footer tetap. Forgot password memberi pemulihan lewat PIN yang sudah diaktifkan atau backup terenkripsi pada instalasi baru tanpa merusak vault aktif. Semua ikon tabungan diganti wallet/coins.

Native Back dan browser history mengikuti halaman serta dialog, dialog paling atas ditutup dahulu, root Dashboard tidak membentuk loop. Pergantian orientasi tidak meremount form. Keyboard native menyembunyikan bottom nav sementara, scroll input dan tombol tetap tersedia.

Ikon wallet + koin Rp orisinal, adaptive Android safe zone dan aset iOS 1024 tanpa alpha; splash branding dibundel, tidak ada server.url. Capacitor iOS SPM, deployment sesuai Capacitor 8, iPhone/iPad orientation disiapkan; build/signing iOS hanya macOS/Xcode di tahap berikutnya.

Validasi: semua unit/regresi; 9 viewport per permintaan, login/nav/card/chart/form dan draft saat rotasi; Back; aset/config native; lint/typecheck/web build/cap sync Android/iOS; SDK aapt/apksigner serta build debug dan Actions sampai green. Emulator/perangkat fisik dicoba bila runtime tersedia; bedakan inspeksi statis APK dari install/startup nyata.
