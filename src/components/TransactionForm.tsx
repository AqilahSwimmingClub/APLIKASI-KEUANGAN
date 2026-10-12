import { CalendarDays } from "lucide-react";
import { useState } from "react";
import type { Data, Transaction } from "../core/model";
import { GENERAL_SAVINGS_ID, localDate, putTransaction } from "../core/ledger";
import { Modal, MoneyInput, amountOf } from "./common";

type Mode = "income" | "expense" | "savings" | "investment";
const modeOf = (initial?: Partial<Transaction>): Mode =>
  initial?.allocation === "savings" || initial?.allocation === "investment"
    ? initial.allocation
    : (initial?.type ?? "expense");

export function TransactionForm({
  data,
  initial,
  onSave,
  onClose,
}: {
  data: Data;
  initial?: Partial<Transaction>;
  onSave: (d: Data) => Promise<void>;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>(modeOf(initial));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const allocation =
    mode === "savings" || mode === "investment" ? mode : "regular";
  const type = mode === "income" ? "income" : "expense";
  const asset = allocation !== "regular";
  const targets = mode === "savings" ? data.goals : data.investments;
  const cats = data.categories.filter((c) => c.type === type);
  const category =
    cats.find((c) => c.id === (asset ? "out-9" : initial?.categoryId))?.id ??
    cats[0]?.id;
  const title =
    mode === "savings"
      ? initial?.id
        ? "EDIT SETORAN"
        : "TAMBAH SETORAN TABUNGAN"
      : mode === "investment"
        ? initial?.id
          ? "EDIT DANA INVESTASI"
          : "TAMBAH DANA INVESTASI"
        : initial?.id
          ? "Edit transaksi"
          : "Tambah transaksi";
  return (
    <Modal title={title} onClose={onClose} dismissible={!busy}>
      <div
        className="tabs type-toggle entry-mode"
        aria-label="Jenis pencatatan"
      >
        {(["income", "expense", "savings", "investment"] as const).map(
          (kind) => (
            <button
              key={kind}
              type="button"
              className={mode === kind ? "active" : ""}
              onClick={() => {
                setMode(kind);
                setError("");
              }}
            >
              {
                {
                  income: "Pemasukan",
                  expense: "Pengeluaran",
                  savings: "Tabungan",
                  investment: "Investasi",
                }[kind]
              }
            </button>
          ),
        )}
      </div>
      <form
        key={mode}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const f = new FormData(e.currentTarget);
            const now = new Date().toISOString();
            const targetId = asset ? String(f.get("target")) : undefined;
            const target = targets.find((x) => x.id === targetId);
            const t: Transaction = {
              id: initial?.id ?? crypto.randomUUID(),
              type,
              date: String(f.get("date")),
              title: asset
                ? `${mode === "savings" ? "Setoran" : "Investasi"} ${target?.name ?? ""}`
                : String(f.get("title")).trim(),
              categoryId: asset ? category : String(f.get("category")),
              amount: amountOf(f),
              note: String(f.get("note") ?? ""),
              allocation,
              targetId,
              createdAt: initial?.createdAt ?? now,
              updatedAt: now,
              demo: initial?.demo,
            };
            await onSave(putTransaction(data, t));
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menyimpan.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {!asset && (
          <label>
            Jenis
            <select
              aria-label="Jenis"
              name="type"
              value={type}
              onChange={(e) => setMode(e.target.value as "income" | "expense")}
            >
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </label>
        )}
        <label>
          Tanggal
          <div className="input-icon">
            <CalendarDays size={18} />
            <input
              aria-label="Tanggal"
              name="date"
              type="date"
              min="1900-01-01"
              max="9999-12-31"
              defaultValue={initial?.date ?? localDate()}
              required
            />
          </div>
        </label>
        {asset ? (
          <label>
            {mode === "savings" ? "Target Tabungan" : "Aset Investasi"}
            <select
              name="target"
              aria-label={
                mode === "savings" ? "Target Tabungan" : "Aset Investasi"
              }
              defaultValue={
                initial?.targetId ??
                (mode === "savings" ? GENERAL_SAVINGS_ID : targets[0]?.id)
              }
              required
            >
              {targets.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {!targets.length && (
              <small>Tambahkan aset investasi terlebih dahulu.</small>
            )}
          </label>
        ) : (
          <>
            <label>
              Nama transaksi
              <input
                name="title"
                aria-label="Nama transaksi"
                maxLength={120}
                required
                defaultValue={initial?.title ?? ""}
                placeholder="Contoh: Belanja kebutuhan rumah"
              />
            </label>
            <label>
              Kategori
              <select name="category" defaultValue={category} required>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <MoneyInput
          label={asset ? "Nominal" : "Nominal (Rp)"}
          name="amount"
          defaultValue={initial?.amount}
        />
        <label>
          Catatan <small>(opsional)</small>
          <textarea name="note" maxLength={2000} defaultValue={initial?.note} />
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button
          disabled={busy || !cats.length || (asset && !targets.length)}
          className="primary full"
        >
          {busy
            ? "Menyimpan…"
            : mode === "savings"
              ? "SIMPAN SETORAN"
              : mode === "investment"
                ? "SIMPAN INVESTASI"
                : "SIMPAN TRANSAKSI"}
        </button>
      </form>
    </Modal>
  );
}
