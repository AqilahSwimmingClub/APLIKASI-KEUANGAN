import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  ChartNoAxesCombined,
  Settings as SettingsIcon,
  PiggyBank,
  TrendingUp,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { registerSW } from "virtual:pwa-register";
import { readSession, rememberSession, forgetSession } from "./core/session";
import type { Data, Transaction } from "./core/model";
import { emptyData, localDate, removeTransaction } from "./core/ledger";
import {
  type Account,
  loadAccount,
  saveAccount,
  createAccount,
  createVault,
  unlockAccount,
  unlockPin,
  unlockBiometric,
  readData,
  saveData,
} from "./core/vault";
import { Credit, Logo, Modal, MonthPicker } from "./components/common";
import { TransactionForm } from "./components/TransactionForm";
import { Login } from "./pages/Login";
import { Overview } from "./pages/Overview";
import { Transactions } from "./pages/Transactions";
import { Assets } from "./pages/Assets";
import { Settings } from "./pages/Settings";
registerSW({ immediate: true });
const nav = [
  ["Dashboard", LayoutDashboard],
  ["Transaksi", ArrowLeftRight],
  ["Laporan", ChartNoAxesCombined],
  ["Tabungan", PiggyBank],
  ["Investasi", TrendingUp],
  ["Pengaturan", SettingsIcon],
] as const;
type Confirmation = {
  title: string;
  message: string;
  action: () => Promise<void>;
};
export default function App() {
  const [account, setAccount] = useState<Account>(),
    [data, setData] = useState<Data>(),
    [key, setKey] = useState(""),
    [ready, setReady] = useState(false),
    [page, setPage] = useState("Dashboard"),
    [month, setMonth] = useState(localDate().slice(0, 7)),
    [form, setForm] = useState<Partial<Transaction> | null>(null),
    [confirmation, setConfirmation] = useState<Confirmation | null>(null),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [busy, setBusy] = useState(false),
    [menu, setMenu] = useState(false);
  const saving = useRef(false),
    lastActivity = useRef(Date.now());
  const logout = useCallback(() => {
    setKey("");
    forgetSession();
    setData(undefined);
    setForm(null);
    setConfirmation(null);
    setPage("Dashboard");
    setMenu(false);
  }, []);
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const a = await loadAccount();
        if (!alive) return;
        setAccount(a);
        const cached = readSession();
        if (a && cached) {
          try {
            const session = cached;
            if (Date.now() - session.time < 15 * 60 * 1000) {
              const d = await readData(session.key);
              if (alive) {
                setKey(session.key);
                setData(d);
              }
            } else forgetSession();
          } catch {
            forgetSession();
          }
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Penyimpanan tidak tersedia.",
        );
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!key) return;
    const activity = () => {
      lastActivity.current = Date.now();
    };
    const interval = setInterval(() => {
      if (Date.now() - lastActivity.current > 15 * 60 * 1000) logout();
    }, 30000);
    window.addEventListener("pointerdown", activity);
    window.addEventListener("keydown", activity);
    return () => {
      clearInterval(interval);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("keydown", activity);
    };
  }, [key, logout]);
  useEffect(() => {
    const theme = data?.settings.theme ?? "system";
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      (document.documentElement.dataset.theme =
        theme === "system" ? (mq.matches ? "dark" : "light") : theme);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [data?.settings.theme]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const listener = (e: Event) => setToast((e as CustomEvent<string>).detail);
    window.addEventListener("krt-error", listener);
    return () => window.removeEventListener("krt-error", listener);
  }, []);
  const onSave = async (d: Data) => {
    if (saving.current)
      throw Error("Penyimpanan sedang berlangsung. Coba lagi sesaat.");
    saving.current = true;
    try {
      await saveData(d, key);
      setData(d);
    } finally {
      saving.current = false;
    }
  };
  const onAccount = async (a: Account) => {
    await saveAccount(a);
    setAccount(a);
  };
  const onLogin = async (
    username: string,
    password: string,
    pin: string,
    remember: boolean,
    mode: "password" | "pin" | "bio",
  ) => {
    let k: string, d: Data, a: Account;
    if (!account) {
      const created = await createAccount(username, password, pin || undefined);
      k = created.key;
      a = created.record;
      d = emptyData();
      await createVault(a, d, k);
      await navigator.storage?.persist?.().catch(() => false);
    } else {
      a = (await loadAccount()) ?? account;
      if (a.lockedUntil > Date.now())
        throw Error(
          "Terlalu banyak percobaan. Tunggu 1 menit sebelum masuk kembali.",
        );
      try {
        if (username !== a.username) throw Error("Username/password salah.");
        k = await (mode === "bio"
          ? unlockBiometric(a)
          : mode === "pin"
            ? unlockPin(a, pin)
            : unlockAccount(a, password));
        d = await readData(k);
      } catch (e) {
        const failures = a.failures + 1;
        const next = {
          ...a,
          failures,
          lockedUntil: failures >= 5 ? Date.now() + 60000 : 0,
        };
        await saveAccount(next);
        setAccount(next);
        throw e;
      }
      a = { ...a, failures: 0, lockedUntil: 0 };
      await saveAccount(a);
    }
    if (remember && !rememberSession(k, Date.now()))
      setToast("Masuk berhasil. Ingat Saya tidak tersedia pada browser ini.");
    if (!remember) forgetSession();
    setAccount(a);
    setKey(k);
    setData(d);
    lastActivity.current = Date.now();
  };
  const navigate = (p: string) => {
    setPage(p);
    setMenu(false);
    window.scrollTo({ top: 0 });
  };
  const confirm = (
    title: string,
    message: string,
    action: () => Promise<void>,
  ) => {
    setError("");
    setConfirmation({ title, message, action });
  };
  const remove = (t: Transaction) =>
    confirm(
      "Hapus transaksi",
      `Hapus “${t.title}”? Dashboard, laporan dan riwayat alokasi akan diperbarui.`,
      async () => {
        await onSave(removeTransaction(data!, t.id));
        setToast("Transaksi dihapus");
      },
    );
  if (!ready)
    return (
      <div className="loading">
        <Logo />
        <p>Membuka penyimpanan aman…</p>
      </div>
    );
  if (!data || !account)
    return (
      <>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <Login account={account} onLogin={onLogin} />
      </>
    );
  const props = {
    data,
    month,
    onEdit: (t: Transaction) => setForm(t),
    onDelete: remove,
  };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="brand">
          <Logo />
          <span>
            Keuangan
            <br />
            <strong>Rumah Tangga</strong>
          </span>
          <button
            className="icon-button mobile-only"
            aria-label="Tutup menu"
            onClick={() => setMenu(false)}
          >
            <X />
          </button>
        </div>
        <div className="nav-label">RUANG KEUANGAN ANDA</div>
        <nav>
          {nav.map(([name, Icon]) => (
            <button
              key={name}
              className={page === name ? "active" : ""}
              onClick={() => navigate(name)}
            >
              <Icon size={21} />
              {name}
              {page === name && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="safe-note">
            <ShieldCheck size={18} />
            <span>
              Pribadi &amp; offline<small>Data terenkripsi di perangkat</small>
            </span>
          </div>
          <Credit />
        </div>
      </aside>
      {menu && (
        <button
          className="menu-backdrop"
          aria-label="Tutup navigasi"
          onClick={() => setMenu(false)}
        />
      )}
      <main className="main-content">
        <header className="topbar">
          <div className="page-title">
            <button
              className="icon-button mobile-only"
              aria-label="Buka menu"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <div>
              <small>KEUANGAN RUMAH TANGGA</small>
              <h1>{page}</h1>
            </div>
          </div>
          <div className="topbar-right">
            <span className="local-badge">
              <span />
              Lokal &amp; aman
            </span>
            <div className="avatar small">
              {data.settings.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </div>
          </div>
        </header>
        <div className="welcome">
          <div>
            <h2>
              {page === "Dashboard"
                ? `Selamat datang, ${data.settings.name.split(",")[0]} 👋`
                : page === "Laporan"
                  ? "Lihat gambaran keuangan keluarga."
                  : page === "Transaksi"
                    ? "Setiap catatan membuat perbedaan."
                    : page === "Pengaturan"
                      ? "Sesuaikan ruang keuangan Anda."
                      : "Wujudkan rencana keluarga Anda."}
            </h2>
            <p>
              {page === "Dashboard"
                ? "Langkah kecil hari ini, ketenangan untuk esok hari."
                : "Kelola • Rencanakan • Evaluasi"}
            </p>
          </div>
          {["Dashboard", "Laporan", "Transaksi"].includes(page) && (
            <MonthPicker month={month} setMonth={setMonth} />
          )}
        </div>
        {["Dashboard", "Laporan"].includes(page) && (
          <Overview
            {...props}
            report={page === "Laporan"}
            onNavigate={navigate}
          />
        )}{" "}
        {page === "Transaksi" && <Transactions key={month} {...props} />}{" "}
        {["Tabungan", "Investasi"].includes(page) && (
          <Assets
            {...props}
            investment={page === "Investasi"}
            onSave={onSave}
            onAdd={setForm}
            confirm={confirm}
          />
        )}{" "}
        {page === "Pengaturan" && (
          <Settings
            data={data}
            account={account}
            vaultKey={key}
            month={month}
            onSave={onSave}
            onAccount={onAccount}
            onNavigate={navigate}
            onLogout={logout}
            confirm={confirm}
            notify={setToast}
          />
        )}
        <div className="mobile-assets">
          <button className="secondary" onClick={() => navigate("Tabungan")}>
            <PiggyBank size={17} />
            Tabungan
          </button>
          <button className="secondary" onClick={() => navigate("Investasi")}>
            <TrendingUp size={17} />
            Investasi
          </button>
        </div>
      </main>
      <button
        className="desktop-add primary"
        aria-label="Tambah transaksi"
        onClick={() => setForm({ date: `${month}-01` })}
      >
        <Plus size={20} />
        Tambah transaksi
      </button>
      <nav className="bottom-nav">
        {nav
          .filter(([name]) => !["Tabungan", "Investasi"].includes(name))
          .map(([name, Icon], i) => (
            <div key={name}>
              {i === 2 && (
                <button
                  className="fab"
                  aria-label="Tambah transaksi"
                  onClick={() => setForm({})}
                >
                  <Plus size={27} />
                </button>
              )}
              <button
                className={page === name ? "active" : ""}
                onClick={() => navigate(name)}
              >
                <Icon size={20} />
                <span>{name}</span>
              </button>
            </div>
          ))}
      </nav>
      {form && (
        <TransactionForm
          data={data}
          initial={form}
          onSave={onSave}
          onClose={() => setForm(null)}
        />
      )}{" "}
      {confirmation && (
        <Modal
          title={confirmation.title}
          onClose={() => {
            if (!busy) setConfirmation(null);
          }}
        >
          <p>{confirmation.message}</p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="actions">
            <button
              className="secondary"
              disabled={busy}
              onClick={() => setConfirmation(null)}
            >
              Batal
            </button>
            <button
              className="primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await confirmation.action();
                  setConfirmation(null);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Operasi gagal.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy
                ? "Memproses…"
                : confirmation.title === "Pulihkan data"
                  ? "Pulihkan data"
                  : "Konfirmasi"}
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
