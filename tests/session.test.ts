import { test, expect, afterEach } from "vitest";
import {
  readSession,
  rememberSession,
  forgetSession,
} from "../src/core/session";
afterEach(() => {
  Reflect.deleteProperty(globalThis, "sessionStorage");
});
test("storage diblokir tidak menggagalkan login tanpa ingat saya dan kunci sesi", () => {
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    get() {
      throw Error("SecurityError");
    },
  });
  expect(readSession()).toBeNull();
  expect(rememberSession("key", 0)).toBe(false);
  expect(() => forgetSession()).not.toThrow();
});
test("sesi tervalidasi dan dapat dihapus", () => {
  const map = new Map<string, string>();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => map.set(k, v),
      removeItem: (k: string) => map.delete(k),
    },
  });
  expect(rememberSession("key", 100)).toBe(true);
  expect(readSession()).toEqual({ key: "key", time: 100 });
  forgetSession();
  expect(readSession()).toBeNull();
  map.set("krt-session", '{"key":12}');
  expect(readSession()).toBeNull();
});
