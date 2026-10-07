import { useState } from "react";
import {
  Eye,
  EyeOff,
  Fingerprint,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";
import { Credit, Logo } from "../components/common";
import type { Account } from "../core/vault";
export function Login({
  account,
  onLogin,
}: {
  account?: Account;
  onLogin: (
    username: string,
    password: string,
    pin: string,
    remember: boolean,
    mode: "password" | "pin" | "bio",
  ) => Promise<void>;
}) {
  const [show, setShow] = useState(false),
    [mode, setMode] = useState<"password" | "pin" | "bio">("password"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="login-page">
      <aside className="login-story">
        <div className="login-brand">
          <Logo />
          <span>
            Keuangan
            <br />
            <b>Rumah Tangga</b>
          </span>
        </div>
        <div>
          <span className="eyebrow">UNTUK MASA DEPAN KELUARGA</span>
          <h1>
            Rencana kecil.
            <br />
            Masa depan
            <br />
            <em>lebih tenang.</em>
          </h1>
          <p>
            Satu tempat untuk setiap pemasukan, pengeluaran, dan impian keluarga
            Anda.
          </p>
          <div className="story-card">
            <PiggyIllustration />
            <div>
              <small>LANGKAH YANG BERARTI</small>
              <strong>
                Kelola hari ini.
                <br />
                Nikmati esok hari.
              </strong>
            </div>
          </div>
        </div>
        <span className="privacy">
          <ShieldCheck size={17} /> Data pribadi, tersimpan di perangkat Anda.
        </span>
      </aside>
      <main className="login-main">
        <div className="login-form">
          <Logo />
          <h1>
            KEUANGAN
            <br />
            RUMAH TANGGA
          </h1>
          <p className="tagline">
            Kelola • Rencanakan • Evaluasi
            <br />
            Keuangan Keluarga Anda
          </p>
          <h2>
            {account ? "Selamat datang kembali" : "Mulai kelola keuangan Anda"}
          </h2>
          <p className="muted">
            {account
              ? "Masuk untuk melanjutkan rencana keluarga."
              : "Buat akun lokal pribadi di perangkat ini."}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const f = new FormData(e.currentTarget);
              try {
                await onLogin(
                  String(f.get("username")),
                  String(f.get("password") ?? ""),
                  String(f.get("pin") ?? ""),
                  f.get("remember") === "on",
                  mode,
                );
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Tidak dapat masuk.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Username
              <input
                name="username"
                aria-label="Username"
                autoComplete="username"
                maxLength={120}
                required
                defaultValue={account?.username}
                placeholder="Username Anda"
              />
            </label>
            {mode === "password" && (
              <label>
                Password
                <div className="password-input">
                  <input
                    name="password"
                    aria-label="Password"
                    type={show ? "text" : "password"}
                    autoComplete={account ? "current-password" : "new-password"}
                    required
                    minLength={account ? 1 : 10}
                    placeholder={
                      account ? "Masukkan password" : "Minimal 10 karakter"
                    }
                  />
                  <button
                    type="button"
                    aria-label={
                      show ? "Sembunyikan password" : "Tampilkan password"
                    }
                    onClick={() => setShow(!show)}
                  >
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </label>
            )}
            {(!account || mode === "pin") && (
              <label>
                PIN 6 digit {!account && <small>(opsional)</small>}
                <input
                  name="pin"
                  aria-label="PIN 6 digit"
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required={mode === "pin"}
                  placeholder="••••••"
                />
              </label>
            )}
            <label className="check">
              <input type="checkbox" name="remember" />
              Ingat Saya <small>(selama tab ini terbuka)</small>
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="primary full" disabled={busy}>
              {busy
                ? "Membuka vault…"
                : account
                  ? "MASUK"
                  : "BUAT AKUN & MASUK"}
            </button>
            {account?.pin && (
              <button
                className="text-button full"
                type="button"
                onClick={() => {
                  setMode(mode === "pin" ? "password" : "pin");
                  setError("");
                }}
              >
                <LockKeyhole size={16} />
                {mode === "pin" ? "Gunakan password" : "Masuk dengan PIN"}
              </button>
            )}
            {account?.bio && (
              <button
                type="button"
                className="secondary full"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await onLogin(account.username, "", "", false, "bio");
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "Biometrik tidak tersedia.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Fingerprint size={18} />
                Masuk dengan biometrik
              </button>
            )}
          </form>
          <div className="login-security">
            <ShieldCheck size={16} /> Vault terenkripsi • Dapat digunakan
            offline
          </div>
          <Credit />
        </div>
      </main>
    </div>
  );
}
function PiggyIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" aria-hidden="true">
      <rect x="8" y="27" width="76" height="50" rx="18" fill="#7fd8bc" />
      <path d="M22 32L26 14L44 28" fill="#7fd8bc" />
      <rect x="77" y="40" width="16" height="20" rx="7" fill="#65c4a6" />
      <circle cx="68" cy="40" r="3" fill="#163b78" />
      <path d="M30 75V84M65 75V84" stroke="#7fd8bc" strokeWidth="10" />
      <path
        d="M34 30H52"
        stroke="#163b78"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="44" cy="12" r="10" fill="#ffd58d" />
      <path d="M44 5V19" stroke="#bf8a31" strokeWidth="2" />
    </svg>
  );
}
