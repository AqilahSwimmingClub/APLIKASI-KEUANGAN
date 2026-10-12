# A-Zuha Finance untuk iPhone dan iPad

Proyek native ada di `ios/App/App.xcodeproj` dengan workspace internal Xcode `ios/App/App.xcodeproj/project.xcworkspace`. Aplikasi menggunakan Capacitor 8/SPM, target iOS 15+, bundle ID `id.fahmidjawas.keuanganrumah`, display name `A-Zuha Finance`, orientasi iPhone/iPad, app icon 1024×1024, dan splash A-Zuha Finance. `npm run ios:sync` menyalin bundle web lokal ke proyek native.

## Validasi tanpa Apple signing

Pada macOS dengan Xcode yang didukung Capacitor, jalankan:

```sh
npm ci
npm run ios:sync
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

Workflow `iOS Simulator Build` menjalankan langkah ini otomatis. Hasilnya adalah build simulator unsigned; tidak dapat dipasang di iPhone fisik dan bukan IPA distribusi. Menjalankan aplikasi di simulator dan perangkat nyata tetap diperlukan untuk menguji keyboard, safe area, file picker/share, WebView, dan biometrik pada iOS.

## Distribusi bertanda tangan

Diperlukan Apple Developer Account, Team ID, signing certificate beserta private key, dan provisioning profile yang cocok dengan bundle ID. Jangan commit sertifikat, private key, profile, `.p12`, atau password. Simpan kredensial pada GitHub Secrets dan impor sementara ke keychain runner saat workflow distribusi diaktifkan. Tentukan `DEVELOPMENT_TEAM` di Signing & Capabilities sesuai tim pemilik; jangan isi ID palsu pada source.

1. **TestFlight:** siapkan App Store distribution certificate dan App Store provisioning profile, `xcodebuild archive` dengan scheme `App` dan destination `generic/platform=iOS`, lalu `xcodebuild -exportArchive` dengan `method=app-store-connect`. Unggah IPA menggunakan App Store Connect API key/Transporter sesuai akun. Versi dan build harus naik pada setiap unggahan.
2. **Direct development/ad hoc:** gunakan development certificate + development profile untuk instalasi perangkat terdaftar, atau Apple Distribution certificate + ad hoc profile yang memuat UDID perangkat. Archive dengan konfigurasi dan Team ID yang sesuai, lalu `xcodebuild -exportArchive` dengan `method=development` atau `method=ad-hoc`.

Contoh kerangka perintah setelah keychain dan profile valid tersedia:

```sh
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -archivePath "$RUNNER_TEMP/A-Zuha-Finance.xcarchive" DEVELOPMENT_TEAM="$APPLE_TEAM_ID" archive
xcodebuild -exportArchive -archivePath "$RUNNER_TEMP/A-Zuha-Finance.xcarchive" -exportOptionsPlist "$RUNNER_TEMP/ExportOptions.plist" -exportPath "$RUNNER_TEMP/azuha-export"
```

`ExportOptions.plist` harus berisi metode distribusi, Team ID, serta mapping profile yang benar. Setelah signing tersedia, beri nama hasil `A-Zuha-Finance-v1.0.4.ipa` untuk versi ini. Workflow iOS manual memakai secrets `APPLE_CERTIFICATE_BASE64`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_PROVISIONING_PROFILE_BASE64`, dan `APPLE_TEAM_ID` untuk arsip ad hoc serta IPA bertanda tangan. Jalankan setelah Release Android signed tersedia agar IPA dapat ditambahkan ke Release versi yang sama. Tanpa secrets, hanya validasi simulator yang dijalankan.
