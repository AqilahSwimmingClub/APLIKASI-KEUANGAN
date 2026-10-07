import { useState } from "react";
import {
  Eye,
  EyeOff,
  Fingerprint,
  ShieldCheck,
  LockKeyhole,
  KeyRound,
} from "lucide-react";
import { Credit, Logo, Modal } from "../components/common";
import { FinanceIllustration } from "../components/Brand";
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
    [mode, setMode] = useState<"password" | "pin">("password"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [forgot, setForgot] = useState(false);
  const selectPin = () => {
    if (account?.pin) {
      setMode("pin");
      setError("");
    } else
      setError(
        "PIN belum diaktifkan. Buat akun dengan PIN atau aktifkan di Keamanan Akun setelah masuk.",
      );
  };
  return (
    <div className="login-page baseline-login">
      <section className="login-identity">
        <FinanceIllustration />
        <div className="login-heading">
          <Logo />
          <h1>KEUANGAN RUMAH TANGGA</h1>
          <p className="tagline">
            Kelola • Rencanakan • Evaluasi
            <br />
            Keuangan Keluarga Anda
          </p>
        </div>
      </section>
      <main className="login-main">
        <div className="login-form">
          <form
            className="login-card"
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
            <h2>
              {account ? "Selamat datang kembali" : "Buat akun lokal Anda"}
            </h2>
            <p className="muted">
              {account
                ? "Masuk untuk melanjutkan rencana keluarga."
                : "Tidak ada password bawaan. Data tersimpan di perangkat ini."}
            </p>
            <label>
              USERNAME
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
                PASSWORD
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
            <div className="login-options">
              <label className="check">
                <input name="remember" type="checkbox" />
                Ingat Saya
              </label>
              <button
                className="text-button"
                type="button"
                onClick={() => setForgot(true)}
              >
                Lupa Password?
              </button>
            </div>
            <small className="remember-hint">
              Ingat Saya berlaku selama tab/sesi ini terbuka.
            </small>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button disabled={busy} className="primary full">
              {busy
                ? "Membuka vault…"
                : account
                  ? "MASUK"
                  : "BUAT AKUN & MASUK"}
            </button>
          </form>
          <section className="login-methods">
            <p>Atau masuk dengan</p>
            <div>
              <button
                className="secondary"
                type="button"
                disabled={busy}
                onClick={async () => {
                  if (!account?.bio) {
                    setError(
                      "Sidik jari belum diaktifkan atau perangkat tidak mendukung. Gunakan password/PIN, lalu buka Keamanan Akun.",
                    );
                    return;
                  }
                  setBusy(true);
                  setError("");
                  try {
                    await onLogin(account.username, "", "", false, "bio");
                  } catch (e) {
                    setError(
                      e instanceof Error
                        ? e.message
                        : "Biometrik tidak tersedia. Gunakan password/PIN.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Fingerprint />
                <span>Sidik Jari</span>
              </button>
              <button
                className={`secondary ${mode === "pin" ? "selected" : ""}`}
                type="button"
                aria-label="Masuk dengan PIN"
                onClick={selectPin}
              >
                <LockKeyhole />
                <span>PIN 6 Digit</span>
              </button>
              <button
                className={`secondary ${mode === "password" ? "selected" : ""}`}
                type="button"
                onClick={() => {
                  setMode("password");
                  setError("");
                }}
              >
                <KeyRound />
                <span>Password</span>
              </button>
            </div>
          </section>
          <section className="login-security">
            <ShieldCheck />
            <div>
              <strong>DATA ANDA AMAN</strong>
              <p>
                Seluruh data keuangan tersimpan secara lokal
                <br />
                di perangkat Anda dan dapat dibackup.
              </p>
            </div>
          </section>
          <Credit />
        </div>
      </main>
      {forgot && (
        <Modal title="Pemulihan akses akun" onClose={() => setForgot(false)}>
          <p>
            Password lokal tidak dapat dikirim ulang atau dibaca. Data aktif
            tetap terlindungi.
          </p>
          {account?.pin ? (
            <button
              className="primary full"
              onClick={() => {
                selectPin();
                setForgot(false);
              }}
            >
              Gunakan PIN yang sudah diaktifkan
            </button>
          ) : (
            <p className="hint">
              Jika PIN/biometrik sudah diaktifkan, gunakan metode tersebut untuk
              masuk. Setelah masuk, backup data sebelum membuat akun baru.
            </p>
          )}
          <p className="hint">
            Jika seluruh metode akses terlupa, pulihkan backup terenkripsi
            dengan password backup yang Anda ketahui pada instalasi/perangkat
            baru. Jangan hapus penyimpanan perangkat lama sebelum backup
            tersedia.
          </p>
          <button className="secondary full" onClick={() => setForgot(false)}>
            Kembali ke login
          </button>
        </Modal>
      )}
    </div>
  );
}
