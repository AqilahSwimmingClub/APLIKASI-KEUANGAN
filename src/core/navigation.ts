import { useEffect, useRef } from "react";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { App as NativeApp } from "@capacitor/app";
import { Keyboard } from "@capacitor/keyboard";
import { SplashScreen } from "@capacitor/splash-screen";
export const pages = [
  "Dashboard",
  "Transaksi",
  "Laporan",
  "Tabungan",
  "Investasi",
  "Pengaturan",
  "Kategori",
];
export function pushPage(page: string) {
  history.pushState(
    { krtPage: page, krtDepth: (history.state?.krtDepth ?? 0) + 1 },
    "",
  );
}
export function useMobileRuntime(
  authenticated: boolean,
  onPage: (p: string) => void,
) {
  const callback = useRef(onPage);
  callback.current = onPage;
  useEffect(() => {
    history.replaceState(
      { krtPage: authenticated ? "Dashboard" : "Login", krtDepth: 0 },
      "",
    );
    const pop = (e: PopStateEvent) => {
      const p = e.state?.krtPage;
      if (pages.includes(p)) callback.current(p);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, [authenticated]);
  useEffect(() => {
    const handles: PluginListenerHandle[] = [];
    let alive = true;
    const retain = (p: Promise<PluginListenerHandle>) =>
      void p
        .then((h) => {
          if (alive) handles.push(h);
          else void h.remove();
        })
        .catch(() => undefined);
    const root = document.documentElement;
    const keyboard = (visible: boolean) => {
      root.dataset.keyboard = visible ? "open" : "closed";
      if (visible)
        requestAnimationFrame(() => {
          (document.activeElement as HTMLElement)?.scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
        });
    };
    const viewport = window.visualViewport;
    let baseline = viewport?.height ?? innerHeight;
    let lastWidth = viewport?.width ?? innerWidth;
    const resize = () => {
      root.style.setProperty(
        "--visual-height",
        `${viewport?.height ?? innerHeight}px`,
      );
      if (Math.abs((viewport?.width ?? innerWidth) - lastWidth) > 50) {
        lastWidth = viewport?.width ?? innerWidth;
        baseline = viewport?.height ?? innerHeight;
        keyboard(false);
        return;
      }
      if (document.activeElement?.matches("input,textarea,select"))
        keyboard((viewport?.height ?? innerHeight) < baseline * 0.72);
      else {
        baseline = Math.max(baseline, viewport?.height ?? innerHeight);
        keyboard(false);
      }
    };
    const reset = () => {
      baseline = viewport?.height ?? innerHeight;
      keyboard(false);
    };
    viewport?.addEventListener("resize", resize);
    window.addEventListener("orientationchange", reset);
    const blur = () => keyboard(false);
    window.addEventListener("focusout", blur);
    if (Capacitor.isNativePlatform()) {
      retain(
        NativeApp.addListener("backButton", () => {
          if (history.state?.krtModal || (history.state?.krtDepth ?? 0) > 0)
            history.back();
          else if (Capacitor.getPlatform() === "android")
            void NativeApp.minimizeApp();
        }),
      );
      retain(Keyboard.addListener("keyboardWillShow", () => keyboard(true)));
      retain(Keyboard.addListener("keyboardDidHide", () => keyboard(false)));
      void SplashScreen.hide().catch(() => undefined);
    }
    return () => {
      alive = false;
      for (const h of handles) void h.remove();
      viewport?.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", reset);
      window.removeEventListener("focusout", blur);
      delete root.dataset.keyboard;
    };
  }, []);
}
