import { useState } from "react";
import { Eye, EyeOff, UserRound, ShieldCheck, LockKeyhole } from "lucide-react";
import { Credit, Logo } from "../components/common";
import { FinanceIllustration } from "../components/Brand";
export function OwnerSetup({
  onCreate,
}: {
  onCreate: (
    name: string,
    username: string,
    password: string,
    pin: string,
  ) => Promise<void>;
}) {
  const [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="login-page baseline-login owner-setup">
      <section className="login-identity">
        <FinanceIllustration />
        <div className="login-heading">
          <Logo />
          <h1>FINORA</h1>
          <p className="brand-descriptor">Keuangan Keluarga</p>
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
            className="login-card owner-card"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              const f = new FormData(e.currentTarget),
                password = String(f.get("password")),
                pin = String(f.get("pin"));
              if (password.length === 0) {
                setError("Password tidak boleh kosong.");
                return;
              }
              if (password !== f.get("confirmPassword")) {
                setError("Konfirmasi password tidak sama.");
                return;
              }
              if (!/^\d{6}$/.test(pin)) {
                setError("PIN harus tepat 6 digit angka.");
                return;
              }
              if (pin !== f.get("confirmPin")) {
                setError("Konfirmasi PIN tidak sama.");
                return;
              }
              setBusy(true);
              try {
                await onCreate(
                  String(f.get("name")),
                  String(f.get("username")),
                  password,
                  pin,
                );
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Gagal membuat akun.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <h2>BUAT AKUN PEMILIK</h2>
            <p className="muted">
              Buat akun pribadi untuk mengamankan data di perangkat ini.
            </p>
            <label>
              Nama
              <div className="input-icon">
                <UserRound size={18} />
                <input
                  name="name"
                  aria-label="Nama"
                  defaultValue="FAHMI DJAWAS, S.Pd."
                  maxLength={120}
                  required
                />
              </div>
            </label>
            <label>
              Username
              <div className="input-icon">
                <UserRound size={18} />
                <input
                  name="username"
                  aria-label="Username"
                  placeholder="Username Anda"
                  autoComplete="username"
                  maxLength={120}
                  required
                />
              </div>
            </label>
            <label>
              Password
              <div className="password-input">
                <LockKeyhole size={18} className="password-lock" />
                <input
                  name="password"
                  aria-label="Password"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Bebas selama tidak kosong"
                  required
                />
                <button
                  type="button"
                  aria-label={
                    show ? "Sembunyikan password" : "Tampilkan password"
                  }
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>
            <label>
              Konfirmasi Password
              <div className="input-icon">
                <LockKeyhole size={18} />
                <input
                  name="confirmPassword"
                  aria-label="Konfirmasi Password"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  required
                />
              </div>
            </label>
            <div className="form-grid">
              <label>
                PIN 6 Digit
                <div className="input-icon">
                  <LockKeyhole size={18} />
                  <input
                    name="pin"
                    aria-label="PIN 6 digit"
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                  />
                </div>
              </label>
              <label>
                Konfirmasi PIN 6 Digit
                <div className="input-icon">
                  <LockKeyhole size={18} />
                  <input
                    name="confirmPin"
                    aria-label="Konfirmasi PIN 6 digit"
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                  />
                </div>
              </label>
            </div>
            <label className="check">
              <input type="checkbox" defaultChecked />
              Aktifkan Biometrik nanti
            </label>
            <small className="hint">
              Biometrik dapat diaktifkan melalui Keamanan Akun jika perangkat
              mendukung.
            </small>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button disabled={busy} className="primary full">
              {busy ? "Membuat akun…" : "BUAT AKUN"}
            </button>
          </form>
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
    </div>
  );
}
