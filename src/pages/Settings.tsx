import { APP_VERSION } from "../core/version";
import { FinanceIcon } from "../components/FinanceIcon";
import { SavingsIcon } from "../components/Brand";
import { useRef, useState } from "react";
import {
  ShieldCheck,
  Tags,
  Settings2,
  Database,
  Download,
  Palette,
  Info,
  LogOut,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
  LockKeyhole,
} from "lucide-react";
import type { Data, Category } from "../core/model";
import {
  type Account,
  seal,
  unseal,
  rewrap,
  unlockAccount,
  registerBiometric,
} from "../core/vault";
import { removeCategory, exportCsv, demoData, emptyData } from "../core/ledger";
import {
  Panel,
  Modal,
  Credit,
  MoneyInput,
  amountOf,
  download,
} from "../components/common";
import { exportPdf } from "./Overview";
type Props = {
  standalone?: boolean;
  data: Data;
  account: Account;
  vaultKey: string;
  month: string;
  onSave: (d: Data) => Promise<void>;
  onAccount: (a: Account) => Promise<void>;
  onNavigate: (p: string) => void;
  onLogout: () => void;
  confirm: (
    title: string,
    message: string,
    action: () => Promise<void>,
  ) => void;
  notify: (message: string) => void;
};
export function Settings(p: Props) {
  const {
    data,
    account,
    vaultKey,
    month,
    onSave,
    onAccount,
    onNavigate,
    onLogout,
    confirm,
    notify,
  } = p;
  const [section, setSection] = useState(p.standalone ? "Kategori" : ""),
    [categoryType, setCategoryType] = useState<"income" | "expense">("income"),
    [cat, setCat] = useState<Category | "new" | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const backupPassword = useRef<HTMLInputElement>(null),
    fileInput = useRef<HTMLInputElement>(null);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operasi gagal.");
    } finally {
      setBusy(false);
    }
  };
  const menus = [
    ["Keamanan Akun", ShieldCheck],
    ["Kategori", Tags],
    ["Target Tabungan", SavingsIcon],
    ["Pengaturan Aplikasi", Settings2],
    ["Backup & Restore", Database],
    ["Export Data", Download],
    ["Tema Aplikasi", Palette],
    ["Tentang Aplikasi", Info],
  ] as const;
  return (
    <div className={p.standalone ? "category-screen" : "settings-screen"}>
      <Panel title="Profil">
        <div className="profile">
          <div className="avatar">FD</div>
          <div>
            <h2>FAHMI DJAWAS, S.Pd.</h2>
            <p>Pemilik Aplikasi</p>
            <small>Akun lokal: {account.username}</small>
          </div>
        </div>
      </Panel>
      <div className="settings-grid">
        <Panel title="Preferensi & data">
          <div className="settings-menu">
            {menus.map(([name, Icon]) => (
              <button
                key={name}
                onClick={() => {
                  setError("");
                  if (name === "Target Tabungan") onNavigate("Tabungan");
                  else if (name === "Kategori") onNavigate("Kategori");
                  else setSection(section === name ? "" : name);
                }}
              >
                <span>
                  <Icon size={20} />
                  {name}
                </span>
                <ChevronRight size={18} />
              </button>
            ))}
            <button className="danger" onClick={onLogout}>
              <span>
                <LogOut size={20} />
                Keluar
              </span>
              <ChevronRight size={18} />
            </button>
          </div>
        </Panel>
        <div>
          {section ? (
            <Panel title={section}>
              {error && (
                <p role="alert" className="error">
                  {error}
                </p>
              )}
              {section === "Keamanan Akun" && (
                <>
                  <p className="hint">
                    Password bebas selama tidak kosong. PIN tetap 6 digit.
                    Biometrik memerlukan verifikasi perangkat dan PRF; perangkat
                    tanpa dukungan menggunakan password/PIN.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      void run(async () => {
                        if (
                          (await unlockAccount(
                            account,
                            String(f.get("current")),
                          )) !== vaultKey
                        )
                          throw Error("Password salah.");
                        const password = String(f.get("new")),
                          repeat = String(f.get("repeat"));
                        if (password !== repeat)
                          throw Error("Konfirmasi password tidak sama.");
                        await onAccount(
                          await rewrap(
                            account,
                            vaultKey,
                            password,
                            String(f.get("pin")) || undefined,
                          ),
                        );
                        notify("Keamanan akun diperbarui");
                      });
                    }}
                  >
                    <label>
                      Password saat ini
                      <div className="input-icon">
                        <LockKeyhole size={18} />
                        <input
                          name="current"
                          type="password"
                          autoComplete="current-password"
                          required
                        />
                      </div>
                    </label>
                    <label>
                      Password baru
                      <div className="input-icon">
                        <LockKeyhole size={18} />
                        <input
                          name="new"
                          type="password"
                          minLength={1}
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    </label>
                    <label>
                      Konfirmasi password baru
                      <div className="input-icon">
                        <LockKeyhole size={18} />
                        <input
                          name="repeat"
                          type="password"
                          minLength={1}
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    </label>
                    <label>
                      PIN baru (kosong untuk menonaktifkan)
                      <div className="input-icon">
                        <LockKeyhole size={18} />
                        <input
                          name="pin"
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]{6}"
                          maxLength={6}
                        />
                      </div>
                    </label>
                    <button disabled={busy} className="primary">
                      Simpan keamanan
                    </button>
                  </form>
                  <button
                    disabled={busy}
                    className="secondary full"
                    onClick={() =>
                      void run(async () => {
                        const updated = await registerBiometric(
                          account,
                          vaultKey,
                        );
                        await onAccount(updated);
                        notify("Biometrik diaktifkan");
                      })
                    }
                  >
                    Aktifkan biometrik perangkat
                  </button>
                  {account.bio && (
                    <button
                      className="text-button"
                      onClick={() =>
                        void run(async () => {
                          await onAccount({ ...account, bio: undefined });
                          notify("Biometrik dinonaktifkan");
                        })
                      }
                    >
                      Nonaktifkan biometrik
                    </button>
                  )}
                </>
              )}
              {section === "Kategori" && (
                <>
                  <button className="primary" onClick={() => setCat("new")}>
                    <Plus size={17} />
                    Tambah kategori
                  </button>
                  <div className="tabs category-tabs">
                    {(["income", "expense"] as const).map((type) => (
                      <button
                        key={type}
                        className={categoryType === type ? "active" : ""}
                        onClick={() => setCategoryType(type)}
                      >
                        {type === "income" ? "Pemasukan" : "Pengeluaran"}
                      </button>
                    ))}
                  </div>
                  {[categoryType].map((type) => (
                    <div key={type}>
                      <h3>{type === "income" ? "Pemasukan" : "Pengeluaran"}</h3>
                      {data.categories
                        .filter((c) => c.type === type)
                        .map((c) => (
                          <div className="category-row" key={c.id}>
                            <FinanceIcon name={c.name} type={c.type} />
                            <span>
                              <strong>{c.name}</strong>
                              <small>
                                {
                                  data.transactions.filter(
                                    (t) => t.categoryId === c.id,
                                  ).length
                                }{" "}
                                transaksi
                              </small>
                            </span>
                            <button
                              className="icon-button"
                              aria-label={`Edit kategori ${c.name}`}
                              onClick={() => setCat(c)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="icon-button danger"
                              aria-label={`Hapus kategori ${c.name}`}
                              onClick={() =>
                                confirm(
                                  "Hapus kategori",
                                  data.transactions.some(
                                    (t) => t.categoryId === c.id,
                                  )
                                    ? "Kategori masih digunakan. Pindahkan transaksi ke kategori lain sebelum menghapus."
                                    : `Hapus kategori ${c.name}?`,
                                  async () => {
                                    await onSave(removeCategory(data, c.id));
                                  },
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                    </div>
                  ))}
                </>
              )}
              {section === "Backup & Restore" && (
                <>
                  <p className="hint">
                    Backup terenkripsi mencakup seluruh transaksi, kategori,
                    target, aset dan preferensi. Simpan password backup
                    terpisah; password akun/PIN tidak ikut diekspor.
                  </p>
                  <label>
                    Password backup
                    <div className="input-icon">
                      <LockKeyhole size={18} />
                      <input
                        ref={backupPassword}
                        aria-label="Password backup"
                        type="password"
                        minLength={1}
                        autoComplete="new-password"
                        placeholder="Bebas selama tidak kosong"
                      />
                    </div>
                  </label>
                  <button
                    disabled={busy}
                    className="primary"
                    onClick={() =>
                      void run(async () => {
                        const e = await seal(
                          data,
                          backupPassword.current?.value ?? "",
                        );
                        download(
                          JSON.stringify(e),
                          `keuangan-backup-${new Date().toISOString().slice(0, 10)}.json`,
                          "application/json",
                        );
                        notify("Backup diunduh");
                      })
                    }
                  >
                    Unduh backup
                  </button>
                  <hr />
                  <label>
                    Pilih file backup
                    <input
                      ref={fileInput}
                      aria-label="Pilih file backup"
                      type="file"
                      accept=".json,application/json"
                    />
                  </label>
                  <button
                    disabled={busy}
                    className="secondary"
                    onClick={() =>
                      void run(async () => {
                        const file = fileInput.current?.files?.[0];
                        if (!file) throw Error("Pilih file backup.");
                        if (file.size > 22000000)
                          throw Error("File terlalu besar (maksimal 22 MB).");
                        const restored = await unseal(
                          JSON.parse(await file.text()),
                          backupPassword.current?.value ?? "",
                        );
                        confirm(
                          "Pulihkan data",
                          `${restored.transactions.length} transaksi, ${restored.goals.length} target dan ${restored.investments.length} aset. Seluruh data aktif akan diganti setelah konfirmasi.`,
                          async () => {
                            await onSave(restored);
                            notify("Backup dipulihkan");
                          },
                        );
                      })
                    }
                  >
                    Validasi backup
                  </button>
                </>
              )}
              {section === "Export Data" && (
                <>
                  <p className="hint">
                    CSV menggunakan pemisah titik koma, kompatibel Excel. PDF
                    berisi ringkasan, evaluasi dan transaksi bulan yang dipilih.
                  </p>
                  <button
                    className="primary full"
                    onClick={() =>
                      download(
                        exportCsv(data),
                        "semua-transaksi.csv",
                        "text/csv;charset=utf-8",
                      )
                    }
                  >
                    Export semua transaksi CSV
                  </button>
                  <button
                    className="secondary full"
                    onClick={() =>
                      download(
                        exportCsv(data, month),
                        `transaksi-${month}.csv`,
                        "text/csv;charset=utf-8",
                      )
                    }
                  >
                    Export transaksi bulanan CSV
                  </button>
                  <button
                    className="secondary full"
                    disabled={busy}
                    onClick={() => void run(() => exportPdf(data, month))}
                  >
                    Export PDF laporan
                  </button>
                </>
              )}
              {section === "Tema Aplikasi" && (
                <label>
                  Tema
                  <select
                    aria-label="Tema"
                    value={data.settings.theme}
                    onChange={(e) =>
                      void run(() =>
                        onSave({
                          ...data,
                          settings: {
                            ...data.settings,
                            theme: e.target.value as Data["settings"]["theme"],
                          },
                        }),
                      )
                    }
                  >
                    <option value="system">Ikuti perangkat</option>
                    <option value="light">Terang</option>
                    <option value="dark">Gelap</option>
                  </select>
                </label>
              )}
              {section === "Pengaturan Aplikasi" && (
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      void run(async () => {
                        const target = amountOf(f, "target");
                        if (
                          !Number.isSafeInteger(target) ||
                          target < 0 ||
                          target > 1e14
                        )
                          throw Error("Target tidak valid.");
                        await onSave({
                          ...data,
                          settings: {
                            ...data.settings,
                            name: String(f.get("name")).trim(),
                            monthlyTarget: target,
                          },
                        });
                        notify("Pengaturan disimpan");
                      });
                    }}
                  >
                    <label>
                      Nama sapaan
                      <input
                        name="name"
                        maxLength={120}
                        required
                        defaultValue={data.settings.name}
                      />
                    </label>
                    <MoneyInput
                      label="Target tabungan bulanan (Rp)"
                      name="target"
                      required={false}
                      defaultValue={data.settings.monthlyTarget}
                    />
                    <button disabled={busy} className="primary">
                      Simpan pengaturan
                    </button>
                  </form>
                  <hr />
                  <button
                    className="secondary full"
                    disabled={busy || data.transactions.some((t) => t.demo)}
                    onClick={() =>
                      confirm(
                        "Tambahkan demo",
                        "Tambahkan 5 transaksi contoh Oktober 2026? Transaksi pribadi tetap tersimpan.",
                        async () => {
                          await onSave(demoData(data));
                          notify("Demo ditambahkan");
                        },
                      )
                    }
                  >
                    Isi data demo Oktober 2026
                  </button>
                  <button
                    className="secondary full"
                    onClick={() =>
                      confirm(
                        "Bersihkan demo",
                        "Hanya transaksi berlabel demo yang akan dihapus.",
                        async () => {
                          await onSave({
                            ...data,
                            transactions: data.transactions.filter(
                              (t) => !t.demo,
                            ),
                          });
                          notify("Demo dibersihkan");
                        },
                      )
                    }
                  >
                    Bersihkan data demo
                  </button>
                  <button
                    className="danger secondary full"
                    onClick={() =>
                      confirm(
                        "Reset seluruh data",
                        "Seluruh transaksi, kategori custom, target dan aset dihapus. Unduh backup sebelum melanjutkan. Akun tetap tersedia.",
                        async () => {
                          await onSave(emptyData());
                          notify("Data direset");
                        },
                      )
                    }
                  >
                    Reset data keuangan
                  </button>
                  <button
                    className="text-button full"
                    onClick={() =>
                      void run(async () => {
                        const granted = await navigator.storage?.persist?.();
                        notify(
                          granted
                            ? "Penyimpanan persisten diaktifkan"
                            : "Browser belum memberikan izin persistensi. Tetap unduh backup berkala.",
                        );
                      })
                    }
                  >
                    Minta penyimpanan persisten
                  </button>
                </>
              )}
              {section === "Tentang Aplikasi" && (
                <>
                  <h2>FINORA</h2>
                  <p>Keuangan Keluarga</p>
                  <p>Versi {APP_VERSION} • Keuangan pribadi, offline.</p>
                  <p>
                    Data dienkripsi di perangkat. Saldo berasal dari ledger
                    transaksi, termasuk alokasi tabungan dan investasi. Nilai
                    aset merupakan modal tercatat.
                  </p>
                  <Credit />
                </>
              )}
            </Panel>
          ) : (
            <Panel title="Privasi dalam kendali Anda">
              <ShieldCheck size={38} className="blue-icon" />
              <h3>Keuangan keluarga tetap pribadi.</h3>
              <p>
                Data tersimpan dalam vault terenkripsi di perangkat ini. Tidak
                ada server untuk transaksi Anda.
              </p>
              <p className="hint">
                Backup berkala melindungi data jika perangkat hilang atau
                penyimpanan browser dibersihkan. Password yang terlupa tidak
                dapat dipulihkan tanpa backup.
              </p>
              <Credit />
            </Panel>
          )}
        </div>
      </div>
      {cat && (
        <Modal title="Kategori" onClose={() => setCat(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void run(async () => {
                const id = cat === "new" ? crypto.randomUUID() : cat.id,
                  name = String(f.get("name")).trim(),
                  type = String(f.get("type")) as Category["type"];
                if (
                  data.categories.some(
                    (c) =>
                      c.id !== id &&
                      c.type === type &&
                      c.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
                  )
                )
                  throw Error("Nama kategori sudah digunakan.");
                if (
                  cat !== "new" &&
                  cat.type !== type &&
                  data.transactions.some((t) => t.categoryId === id)
                )
                  throw Error("Jenis kategori terpakai tidak dapat diubah.");
                await onSave({
                  ...data,
                  categories: [
                    ...data.categories.filter((c) => c.id !== id),
                    { id, name, type },
                  ],
                });
                setCategoryType(type);
                setCat(null);
              });
            }}
          >
            <label>
              Nama kategori
              <input
                name="name"
                required
                maxLength={120}
                defaultValue={cat === "new" ? "" : cat.name}
              />
            </label>
            <label>
              Jenis kategori
              <select
                name="type"
                defaultValue={cat === "new" ? "expense" : cat.type}
              >
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </label>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="primary full" disabled={busy}>
              Simpan kategori
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
