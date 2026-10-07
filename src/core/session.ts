export function readSession(): { key: string; time: number } | null {
  try {
    const raw = sessionStorage.getItem("krt-session");
    if (!raw) return null;
    const s = JSON.parse(raw);
    return typeof s.key === "string" &&
      typeof s.time === "number" &&
      Number.isFinite(s.time) &&
      s.time <= Date.now()
      ? s
      : null;
  } catch {
    return null;
  }
}
export function rememberSession(key: string, time: number): boolean {
  try {
    sessionStorage.setItem("krt-session", JSON.stringify({ key, time }));
    return true;
  } catch {
    return false;
  }
}
export function forgetSession(): void {
  try {
    sessionStorage.removeItem("krt-session");
  } catch {
    /* Memory still locks when the browser blocks storage. */
  }
}
