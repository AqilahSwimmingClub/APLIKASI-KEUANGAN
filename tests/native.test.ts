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
    "Keuangan Rumah Tangga",
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
  expect(read("android/app/build.gradle")).toContain("versionCode 2");
  expect(read("ios/App/App.xcodeproj/project.pbxproj")).toContain(
    `MARKETING_VERSION = ${pkg.version};`,
  );
  expect(read("ios/App/App.xcodeproj/project.pbxproj")).toContain(
    "CURRENT_PROJECT_VERSION = 2;",
  );
});
