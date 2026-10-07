import { useState } from "react";
import {
  Pencil,
  Trash2,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import type { Data, Transaction } from "../core/model";
import { rupiah } from "../core/ledger";
import { Empty, Panel } from "../components/common";
export function TransactionList({
  data,
  rows,
  onEdit,
  onDelete,
}: {
  data: Data;
  rows: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}) {
  if (!rows.length)
    return (
      <Empty>
        Belum ada transaksi. Catat pemasukan atau pengeluaran pertama Anda.
      </Empty>
    );
  return (
    <div className="transaction-list">
      {rows.map((t) => (
        <div className="transaction" key={t.id}>
          <div className={`tx-icon ${t.type}`}>
            {t.type === "income" ? <ArrowDownLeft /> : <ArrowUpRight />}
          </div>
          <div className="tx-name">
            <strong>{t.title}</strong>
            <small>
              {data.categories.find((c) => c.id === t.categoryId)?.name} ·{" "}
              {t.date}
              {t.allocation !== "regular"
                ? ` · ${t.allocation === "savings" ? "Tabungan" : "Investasi"}`
                : ""}
            </small>
            {t.note && <small>{t.note}</small>}
          </div>
          <b className={t.type === "income" ? "positive" : "negative"}>
            {t.type === "income" ? "+" : "−"}
            {rupiah(t.amount)}
          </b>
          <div className="tx-actions">
            <button
              className="icon-button"
              aria-label={`Edit ${t.title}`}
              onClick={() => onEdit(t)}
            >
              <Pencil size={16} />
            </button>
            <button
              className="icon-button danger"
              aria-label={`Hapus ${t.title}`}
              onClick={() => onDelete(t)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
export function Transactions({
  data,
  month,
  onEdit,
  onDelete,
}: {
  data: Data;
  month: string;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}) {
  const [type, setType] = useState("all"),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [period, setPeriod] = useState(month),
    [sort, setSort] = useState("new"),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const rows = data.transactions
    .filter(
      (t) =>
        (type === "all" || t.type === type) &&
        (!period || t.date.startsWith(period)) &&
        (!category || t.categoryId === category) &&
        (!from || t.date >= from) &&
        (!to || t.date <= to) &&
        `${t.title} ${t.note}`
          .toLocaleLowerCase("id")
          .includes(search.toLocaleLowerCase("id")),
    )
    .sort(
      (a, b) =>
        (sort === "new" ? -1 : 1) * a.date.localeCompare(b.date) ||
        b.createdAt.localeCompare(a.createdAt),
    );
  const dates = [...new Set(rows.map((t) => t.date))];
  return (
    <>
      <div className="tabs">
        {[
          ["all", "Semua"],
          ["income", "Pemasukan"],
          ["expense", "Pengeluaran"],
        ].map(([v, l]) => (
          <button
            key={v}
            className={type === v ? "active" : ""}
            onClick={() => setType(v)}
          >
            {l}
          </button>
        ))}
      </div>
      <Panel title="Catatan transaksi">
        <div className="filters">
          <label className="search">
            <Search size={18} />
            <input
              aria-label="Cari transaksi"
              placeholder="Cari transaksi…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            Bulan & tahun
            <input
              type="month"
              aria-label="Filter bulan dan tahun"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </label>
          <label>
            Kategori
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Semua kategori</option>
              {data.categories.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name} ({c.type === "income" ? "Masuk" : "Keluar"})
                </option>
              ))}
            </select>
          </label>
          <label>
            Urutan
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="new">Terbaru</option>
              <option value="old">Terlama</option>
            </select>
          </label>
          <label>
            Dari tanggal
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            Sampai tanggal
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <button
            className="secondary"
            onClick={() => {
              setPeriod("");
              setCategory("");
              setFrom("");
              setTo("");
              setSearch("");
              setType("all");
            }}
          >
            Semua periode
          </button>
        </div>
        <p className="hint">{rows.length} transaksi ditemukan</p>
        {dates.length ? (
          dates.map((date) => (
            <div key={date}>
              <h3 className="date-group">
                {new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(
                  new Date(
                    ...(date
                      .split("-")
                      .map((n, i) => (i === 1 ? Number(n) - 1 : Number(n))) as [
                      number,
                      number,
                      number,
                    ]),
                  ),
                )}
              </h3>
              <TransactionList
                data={data}
                rows={rows.filter((t) => t.date === date)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ))
        ) : (
          <Empty>Tidak ada transaksi yang sesuai filter.</Empty>
        )}
      </Panel>
    </>
  );
}
