import { test, expect } from "vitest";
import { readFileSync } from "node:fs";
import config from "../capacitor.config";
const read = (p: string) => readFileSync(p, "utf8");
test("native production bundles local assets, keeps app identity and allows rotation", () => {
  expect(config.appId).toBe("id.fahmidjawas.keuanganrumah");
  expect(config.webDir).toBe("dist");
  expect(config.server?.url).toBeUndefined();
  const manifest = read("android/app/src/main/AndroidManifest.xml");
  expect(manifest).not.toContain("screenOrientation=");
  expect(manifest).toContain("android.intent.category.LAUNCHER");
  expect(manifest).toContain("adjustResize");
  expect(read("android/app/src/main/res/values/strings.xml")).toContain(
    "A-Zuha Finance",
  );
});
test("iOS phone/tablet orientations, compatible SPM project and original opaque icon", () => {
  const plist = read("ios/App/App/Info.plist");
  expect(plist).toContain("UISupportedInterfaceOrientations~ipad");
  expect(plist.match(/UIInterfaceOrientationLandscapeLeft/g)).toHaveLength(2);
  expect(plist.match(/UIInterfaceOrientationLandscapeRight/g)).toHaveLength(2);
  expect(read("ios/App/App.xcodeproj/project.pbxproj")).toContain(
    'TARGETED_DEVICE_FAMILY = "1,2"',
  );
  expect(read("ios/App/CapApp-SPM/Package.swift")).toContain("8.5.2");
  const png = readFileSync(
    "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png",
  );
  expect(png.readUInt32BE(16)).toBe(1024);
  expect(png[25]).toBe(2);
});

test("release versions agree across package, Android, iOS and UI", async () => {
  const pkg = JSON.parse(read("package.json"));
  const { APP_VERSION } = await import("../src/core/version");
  expect(APP_VERSION).toBe(pkg.version);
  expect(read("android/app/build.gradle")).toContain(
    `versionName "${pkg.version}"`,
  );
  expect(read("android/app/build.gradle")).toContain("versionCode 5");
  expect(read("ios/App/App.xcodeproj/project.pbxproj")).toContain(
    `MARKETING_VERSION = ${pkg.version};`,
  );
  expect(read("ios/App/App.xcodeproj/project.pbxproj")).toContain(
    "CURRENT_PROJECT_VERSION = 5;",
  );
});

test("A-Zuha Finance native display names and unsigned iOS validation workflow", () => {
  expect(config.appName).toBe("A-Zuha Finance");
  expect(read("ios/App/App/Info.plist")).toContain("<string>A-Zuha Finance</string>");
  const ios = read(".github/workflows/ios.yml");
  expect(ios).toContain("macos-latest");
  expect(ios).toContain("cap sync ios");
  expect(ios).toContain("CODE_SIGNING_ALLOWED=NO");
  expect(ios).toContain("xcodebuild");
  const android = read(".github/workflows/android.yml");
  for (const secret of ["ANDROID_KEYSTORE_BASE64", "ANDROID_KEY_ALIAS", "ANDROID_KEY_PASSWORD", "ANDROID_KEYSTORE_PASSWORD"])
    expect(android).toContain(secret);
  expect(android).toContain("A-Zuha-Finance-v");
});

test("native biometric bridges require protected key retrieval on both platforms", () => {
  expect(read("android/app/src/main/java/id/fahmidjawas/keuanganrumah/MainActivity.java"))
    .toContain("registerPlugin(NativeVaultPlugin.class)");
  const android = read("android/app/src/main/java/id/fahmidjawas/keuanganrumah/NativeVaultPlugin.java");
  expect(android).toContain("BiometricPrompt.CryptoObject(cipher)");
  expect(android).toContain("setUserAuthenticationRequired(true)");
  const ios = read("ios/App/App/AppDelegate.swift");
  expect(ios).toContain(".biometryCurrentSet");
  expect(ios).toContain("SecItemCopyMatching");
  expect(read("ios/App/App/SceneDelegate.swift")).toContain("AzuhaBridgeViewController()");
});
