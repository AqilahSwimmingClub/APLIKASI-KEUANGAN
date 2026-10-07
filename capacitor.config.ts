import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";
const config: CapacitorConfig = {
  appId: "id.fahmidjawas.keuanganrumah",
  appName: "Keuangan Rumah Tangga",
  webDir: "dist",
  server: { androidScheme: "https" },
  android: { allowMixedContent: false },
  ios: { contentInset: "never" },
  plugins: {
    SystemBars: { insetsHandling: "css" },
    Keyboard: { resize: KeyboardResize.Native, resizeOnFullScreen: false },
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      backgroundColor: "#163b78",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};
export default config;
