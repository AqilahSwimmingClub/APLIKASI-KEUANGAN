import { ArrowDownLeft, ArrowUpRight, CalendarDays, TextCursorInput } from "lucide-react";
import { useState } from "react";
import type { Data, Transaction } from "../core/model";
import { localDate, putTransaction } from "../core/ledger";
import { Modal, MoneyInput, amountOf } from "./common";
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
  const [type, setType] = useState(initial?.type ?? "expense"),
    [allocation, setAllocation] = useState(initial?.allocation ?? "regular"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const cats = data.categories.filter((c) => c.type === type);
  const targets = allocation === "savings" ? data.goals : data.investments;
  return (
    <Modal
      title={
        initial?.id
          ? "Edit transaksi"
          : allocation === "regular"
            ? "Tambah transaksi"
            : "Tambah alokasi"
      }
      onClose={onClose}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const f = new FormData(e.currentTarget),
              now = new Date().toISOString();
            const t: Transaction = {
              id: initial?.id ?? crypto.randomUUID(),
              type,
              date: String(f.get("date")),
              title: String(f.get("title")).trim(),
              categoryId: String(f.get("category")),
              amount: amountOf(f),
              note: String(f.get("note")),
              allocation: type === "income" ? "regular" : allocation,
              targetId:
                type === "expense" && allocation !== "regular"
                  ? String(f.get("target"))
                  : undefined,
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
        <div className="tabs type-toggle">
          {(["income", "expense"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              className={`${kind} ${type === kind ? "active" : ""}`}
              onClick={() => {
                setType(kind);
                if (kind === "income") setAllocation("regular");
              }}
            >
              {kind === "income" ? (
                <ArrowDownLeft size={18} />
              ) : (
                <ArrowUpRight size={18} />
              )}{" "}
              {kind === "income" ? "Pemasukan" : "Pengeluaran"}
            </button>
          ))}
        </div>
        <div className="form-grid">
          <label className="type-select">
            Jenis
            <select
              aria-label="Jenis"
              name="type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as Transaction["type"]);
                if (e.target.value === "income") setAllocation("regular");
              }}
            >
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </label>
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
        </div>
        <label>
          Nama transaksi
          <div className="input-icon">
            <TextCursorInput size={18} />
            <input
              name="title"
              aria-label="Nama transaksi"
              maxLength={120}
              defaultValue={initial?.title ?? ""}
              required
              placeholder="Contoh: Belanja kebutuhan rumah"
            />
          </div>
        </label>
        <div className="form-grid">
          <label>
            Kategori
            <select
              key={type}
              name="category"
              defaultValue={
                initial?.categoryId &&
                cats.some((c) => c.id === initial.categoryId)
                  ? initial.categoryId
                  : cats[0]?.id
              }
              required
            >
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <MoneyInput
            label="Nominal (Rp)"
            name="amount"
            defaultValue={initial?.amount}
          />
        </div>
        {type === "expense" && (
          <label>
            Alokasi
            <select
              aria-label="Alokasi"
              value={allocation}
              onChange={(e) =>
                setAllocation(e.target.value as Transaction["allocation"])
              }
            >
              <option value="regular">Pengeluaran biasa</option>
              <option value="savings">Tabungan</option>
              <option value="investment">Investasi</option>
            </select>
          </label>
        )}
        {type === "expense" && allocation !== "regular" && (
          <label>
            Target
            <select name="target" defaultValue={initial?.targetId} required>
              <option value="">Pilih target</option>
              {targets.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {!targets.length && (
              <small>
                Tambahkan target/aset di menu{" "}
                {allocation === "savings" ? "Tabungan" : "Investasi"} terlebih
                dahulu.
              </small>
            )}
          </label>
        )}
        <label>
          Catatan <small>(opsional)</small>
          <textarea name="note" maxLength={2000} defaultValue={initial?.note} />
        </label>
        {allocation !== "regular" && (
          <p className="hint">
            Alokasi dihitung sebagai pengeluaran satu kali. Riwayat dan laporan
            mengikuti transaksi ini.
          </p>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button disabled={busy || !cats.length} className="primary full">
          {busy ? "Menyimpan…" : "SIMPAN TRANSAKSI"}
        </button>
      </form>
    </Modal>
  );
}
