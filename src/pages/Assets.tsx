import { useState } from "react";
import { PiggyBank, TrendingUp, Pencil, Trash2, Plus } from "lucide-react";
import type { Data, Goal, Investment, Transaction } from "../core/model";
import { targetTotal, rupiah } from "../core/ledger";
import {
  Modal,
  Panel,
  Empty,
  MoneyInput,
  amountOf,
} from "../components/common";
import { CategoriesChart } from "../components/Charts";
import { TransactionList } from "./Transactions";
export function Assets({
  data,
  month,
  investment = false,
  onSave,
  onAdd,
  onEdit,
  onDelete,
  confirm,
}: {
  data: Data;
  month: string;
  investment?: boolean;
  onSave: (d: Data) => Promise<void>;
  onAdd: (t: Partial<Transaction>) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  confirm: (
    title: string,
    message: string,
    action: () => Promise<void>,
  ) => void;
}) {
  const [editing, setEditing] = useState<Goal | Investment | "new" | null>(
      null,
    ),
    [history, setHistory] = useState<string | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const items = investment ? data.investments : data.goals;
  const total = items.reduce((s, g) => s + targetTotal(data, g.id), 0);
  return (
    <>
      <section className={`asset-hero ${investment ? "violet" : ""}`}>
        <div>
          <span className="eyebrow">
            {investment ? "PORTFOLIO KELUARGA" : "RENCANA MASA DEPAN"}
          </span>
          <h2>{rupiah(total)}</h2>
          <p>
            Total {investment ? "modal investasi" : "tabungan"} dari transaksi
            aktual
          </p>
        </div>
        {investment ? <TrendingUp size={64} /> : <PiggyBank size={64} />}
      </section>
      <div className="section-heading">
        <div>
          <h2>{investment ? "Aset investasi" : "Target tabungan"}</h2>
          <p>
            {investment
              ? "Bangun masa depan, satu langkah setiap hari."
              : "Setiap setoran mendekatkan rencana Anda."}
          </p>
        </div>
        <button
          className="primary"
          onClick={() => {
            setEditing("new");
            setError("");
          }}
        >
          <Plus size={18} />
          {investment ? "Tambah investasi" : "Tambah target"}
        </button>
      </div>
      <div className="asset-grid">
        {items.map((g) => {
          const amount = targetTotal(data, g.id),
            goal = g as Goal;
          return (
            <section className="panel asset" key={g.id}>
              <div className="asset-heading">
                <div className="asset-icon">
                  {investment ? <TrendingUp /> : <PiggyBank />}
                </div>
                <div>
                  <h3>{g.name}</h3>
                  <small>
                    {investment
                      ? (g as Investment).kind
                      : `Target ${goal.month}`}
                  </small>
                </div>
                <button
                  className="icon-button"
                  aria-label={`Edit target ${g.name}`}
                  onClick={() => {
                    setEditing(g);
                    setError("");
                  }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="icon-button danger"
                  aria-label={`Hapus target ${g.name}`}
                  onClick={() =>
                    confirm(
                      "Hapus " + (investment ? "investasi" : "target"),
                      data.transactions.some((t) => t.targetId === g.id)
                        ? "Target masih digunakan. Hapus atau pindahkan seluruh transaksi tertaut terlebih dahulu."
                        : "Target yang belum digunakan akan dihapus.",
                      async () => {
                        if (data.transactions.some((t) => t.targetId === g.id))
                          throw Error("Target masih memiliki transaksi.");
                        await onSave(
                          investment
                            ? {
                                ...data,
                                investments: data.investments.filter(
                                  (i) => i.id !== g.id,
                                ),
                              }
                            : {
                                ...data,
                                goals: data.goals.filter((i) => i.id !== g.id),
                              },
                        );
                      },
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <strong className="asset-value">{rupiah(amount)}</strong>
              {!investment && (
                <>
                  <div className="progress-caption">
                    <span>dari {rupiah(goal.target)}</span>
                    <b>{Math.round((amount / goal.target) * 100)}%</b>
                  </div>
                  <progress value={amount} max={goal.target} />
                </>
              )}
              <div className="actions">
                <button
                  className="secondary"
                  aria-label={`${investment ? "Tambah dana" : "Setor"} ${g.name}`}
                  onClick={() =>
                    onAdd({
                      type: "expense",
                      allocation: investment ? "investment" : "savings",
                      targetId: g.id,
                      title: `${investment ? "Investasi" : "Setoran"} ${g.name}`,
                      categoryId: "out-9",
                    })
                  }
                >
                  <Plus size={16} />
                  {investment ? "Tambah dana" : "Tambah setoran"}
                </button>
                <button
                  className="text-button"
                  onClick={() => setHistory(g.id)}
                >
                  Riwayat
                </button>
              </div>
            </section>
          );
        })}
      </div>
      {!items.length && (
        <Empty>
          {investment
            ? "Belum ada aset. Tambahkan investasi pertama Anda."
            : "Belum ada target. Mulai dengan Dana Darurat atau rencana keluarga."}
        </Empty>
      )}
      {investment && (
        <Panel title="Komposisi Portfolio">
          <CategoriesChart
            rows={items
              .map((i) => ({ name: i.name, amount: targetTotal(data, i.id) }))
              .filter((i) => i.amount > 0)}
          />
        </Panel>
      )}
      {history && (
        <Modal
          title={`Riwayat ${items.find((i) => i.id === history)?.name ?? ""}`}
          onClose={() => setHistory(null)}
        >
          <TransactionList
            data={data}
            rows={data.transactions
              .filter((t) => t.targetId === history)
              .sort((a, b) => b.date.localeCompare(a.date))}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Modal>
      )}
      {editing && (
        <Modal
          title={investment ? "Investasi" : "Target tabungan"}
          onClose={() => setEditing(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const f = new FormData(e.currentTarget),
                  id = editing === "new" ? crypto.randomUUID() : editing.id,
                  name = String(f.get("name")).trim();
                if (!name) throw Error("Nama wajib diisi.");
                if (investment) {
                  const item = {
                    id,
                    name,
                    kind: String(f.get("kind")) as Investment["kind"],
                  };
                  await onSave({
                    ...data,
                    investments: [
                      ...data.investments.filter((g) => g.id !== id),
                      item,
                    ],
                  });
                } else {
                  const target = amountOf(f, "target");
                  if (
                    !Number.isSafeInteger(target) ||
                    target <= 0 ||
                    target > 1e14
                  )
                    throw Error("Target harus angka Rupiah positif.");
                  await onSave({
                    ...data,
                    goals: [
                      ...data.goals.filter((g) => g.id !== id),
                      { id, name, target, month: String(f.get("month")) },
                    ],
                  });
                }
                setEditing(null);
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Gagal menyimpan.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              {investment ? "Nama investasi" : "Nama target"}
              <input
                aria-label={investment ? "Nama investasi" : "Nama target"}
                name="name"
                required
                maxLength={120}
                defaultValue={editing === "new" ? "" : editing.name}
              />
            </label>
            {investment ? (
              <label>
                Jenis investasi
                <select
                  name="kind"
                  defaultValue={
                    editing === "new"
                      ? "Reksa Dana"
                      : (editing as Investment).kind
                  }
                >
                  {["Reksa Dana", "Emas", "Saham", "Deposito", "Lainnya"].map(
                    (k) => (
                      <option key={k}>{k}</option>
                    ),
                  )}
                </select>
              </label>
            ) : (
              <>
                <MoneyInput
                  label="Target (Rp)"
                  name="target"
                  defaultValue={
                    editing === "new" ? 0 : (editing as Goal).target
                  }
                />
                <label>
                  Bulan target
                  <input
                    type="month"
                    name="month"
                    required
                    defaultValue={
                      editing === "new" ? month : (editing as Goal).month
                    }
                  />
                </label>
              </>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button disabled={busy} className="primary full">
              {investment ? "Simpan investasi" : "Simpan target"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
