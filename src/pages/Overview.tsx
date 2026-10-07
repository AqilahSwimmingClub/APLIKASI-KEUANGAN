import { SavingsIcon } from "../components/Brand";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  Download,
} from "lucide-react";
import type { Data, Transaction } from "../core/model";
import {
  summarize,
  previousMonth,
  shiftMonth,
  categoryTotals,
  evaluations,
  targetTotal,
  rupiah,
  monthLabel,
  exportCsv,
} from "../core/ledger";
import { Panel, Metric, Delta, Empty, download } from "../components/common";
import { saveFile } from "../core/files";
import { CategoriesChart, TrendChart } from "../components/Charts";
import { TransactionList } from "./Transactions";
export async function exportPdf(data: Data, month: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const s = summarize(data, month),
    p = summarize(data, previousMonth(month));
  let y = 20;
  const line = (text: string, size = 11) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 175);
    if (y + lines.length * 6 > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(lines, 17, y);
    y += lines.length * 6 + 3;
  };
  line("Keuangan Rumah Tangga", 20);
  line(`Laporan ${monthLabel(month)}`, 14);
  for (const [k, l] of [
    ["income", "Pemasukan"],
    ["expense", "Pengeluaran"],
    ["balance", "Sisa"],
    ["savings", "Tabungan"],
    ["investment", "Investasi"],
  ] as const)
    line(
      `${l}: ${rupiah(s[k])} | Bulan lalu ${rupiah(p[k])} | Selisih ${rupiah(s[k] - p[k])}`,
    );
  line("Evaluasi", 14);
  evaluations(data, month).forEach((t) => line(t));
  line("Kategori pengeluaran", 14);
  categoryTotals(data, month, "expense").forEach((c) =>
    line(`${c.name}: ${rupiah(c.amount)}`),
  );
  line("Kategori pemasukan", 14);
  categoryTotals(data, month, "income").forEach((c) =>
    line(`${c.name}: ${rupiah(c.amount)}`),
  );
  line("Transaksi", 14);
  s.transactions
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((t) =>
      line(
        `${t.date} | ${t.title} | ${t.type === "income" ? "+" : "-"} ${rupiah(t.amount)}`,
      ),
    );
  line("Dirancang & Dikembangkan oleh FAHMI DJAWAS, S.Pd.");
  line("© 2026 Semua Hak Dilindungi");
  await saveFile(
    doc.output("arraybuffer"),
    `laporan-${month}.pdf`,
    "application/pdf",
  );
}
export function Overview({
  data,
  month,
  report = false,
  onEdit,
  onDelete,
  onNavigate,
}: {
  data: Data;
  month: string;
  report?: boolean;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  onNavigate: (p: string) => void;
}) {
  const s = summarize(data, month),
    p = summarize(data, previousMonth(month));
  const trend = Array.from({ length: 6 }, (_, i) => {
    const m = shiftMonth(month, i - 5);
    return { month: m, ...summarize(data, m) };
  });
  const top = categoryTotals(data, month, "expense")[0];
  return (
    <>
      {!report ? (
        <section className="hero">
          <div>
            <span className="eyebrow">SALDO BULAN INI</span>
            <h2 data-testid="balance">{rupiah(s.balance)}</h2>
            <p>Ruang untuk mewujudkan rencana keluarga.</p>
            <div className="hero-bottom">
              <span>
                <Wallet size={16} /> {monthLabel(month)}
              </span>
              <span>Selisih {rupiah(s.balance - p.balance)}</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-orbit" />
            <Wallet size={74} />
            <span className="art-mini">
              <TrendingUp size={22} /> Keuangan terencana
            </span>
          </div>
        </section>
      ) : (
        <div className="report-banner">
          <div>
            <span className="eyebrow">RINGKASAN BULANAN</span>
            <h2>{monthLabel(month)}</h2>
            <p>
              Sisa dana <strong>{rupiah(s.balance)}</strong>
            </p>
          </div>
          <div className="actions">
            <button
              className="secondary"
              onClick={() =>
                download(
                  exportCsv(data, month),
                  `transaksi-${month}.csv`,
                  "text/csv;charset=utf-8",
                )
              }
            >
              <Download size={16} /> CSV bulan ini
            </button>
            <button
              className="primary"
              onClick={() =>
                void exportPdf(data, month).catch((e) =>
                  window.dispatchEvent(
                    new CustomEvent("krt-error", {
                      detail:
                        e instanceof Error ? e.message : "Ekspor PDF gagal.",
                    }),
                  ),
                )
              }
            >
              PDF laporan
            </button>
          </div>
        </div>
      )}
      <div className="metrics">
        {[
          ["income", "Pemasukan", "green", ArrowDownLeft],
          ["expense", "Pengeluaran", "red", ArrowUpRight],
          ["savings", "Tabungan", "blue", SavingsIcon],
          ["investment", "Investasi", "purple", TrendingUp],
        ].map(([key, label, color, Icon]) => {
          const k = key as "income" | "expense" | "savings" | "investment";
          const C = Icon as typeof Wallet;
          return (
            <div key={k} className="metric-wrap">
              <C size={20} />
              <Metric
                label={label as string}
                value={s[k]}
                previous={p[k]}
                color={color as string}
              />
            </div>
          );
        })}
      </div>
      <div className="dashboard-grid">
        <Panel title="Pemasukan vs Pengeluaran">
          <TrendChart
            rows={[
              { month: previousMonth(month), ...p },
              { month, ...s },
            ]}
          />
        </Panel>
        <Panel title="Pengeluaran per Kategori">
          <CategoriesChart rows={categoryTotals(data, month, "expense")} />
        </Panel>
        <Panel title="Tren Keuangan • 6 Bulan">
          <TrendChart rows={trend} />
        </Panel>
        {report ? (
          <Panel title="Pemasukan per Kategori">
            <CategoriesChart rows={categoryTotals(data, month, "income")} />
          </Panel>
        ) : (
          <Panel
            title="Target Bulan Ini"
            action={
              <button
                className="text-button"
                onClick={() => onNavigate("Tabungan")}
              >
                Lihat semua ↗
              </button>
            }
          >
            {data.settings.monthlyTarget > 0 && (
              <div className="goal-mini">
                <strong>Target tabungan bulan ini</strong>
                <span>
                  {rupiah(s.savings)} / {rupiah(data.settings.monthlyTarget)}
                </span>
                <progress max={data.settings.monthlyTarget} value={s.savings} />
              </div>
            )}
            {data.goals
              .filter((g) => g.month === month)
              .map((g) => (
                <div className="goal-mini" key={g.id}>
                  <strong>{g.name}</strong>
                  <span>
                    {rupiah(targetTotal(data, g.id))} / {rupiah(g.target)}
                  </span>
                  <progress value={targetTotal(data, g.id)} max={g.target} />
                </div>
              ))}
            {!data.goals.some((g) => g.month === month) &&
              !data.settings.monthlyTarget && (
                <Empty>Atur target tabungan untuk rencana bulan ini.</Empty>
              )}
          </Panel>
        )}
        <Panel title="Perbandingan dengan Bulan Lalu">
          <div className="comparison-head">
            <span>{monthLabel(previousMonth(month))}</span>
            <b>→</b>
            <span>{monthLabel(month)}</span>
          </div>
          {[
            ["income", "Pemasukan"],
            ["expense", "Pengeluaran"],
            ["balance", "Saldo"],
            ["savings", "Tabungan"],
            ["investment", "Investasi"],
          ].map(([k, l]) => {
            const key = k as
              "income" | "expense" | "balance" | "savings" | "investment";
            return (
              <div className="comparison-row" key={k}>
                <span>
                  {l}
                  <small>
                    {rupiah(p[key])} → {rupiah(s[key])}
                  </small>
                </span>
                <div>
                  <b>{rupiah(s[key] - p[key])}</b>
                  <Delta now={s[key]} prev={p[key]} />
                </div>
              </div>
            );
          })}
        </Panel>
        <Panel title="Evaluasi Keuangan">
          <div className="evaluation-label">
            <span>✦</span> Insight dari catatan Anda
          </div>
          {evaluations(data, month).map((t) => (
            <p className="insight" key={t}>
              {t}
            </p>
          ))}
          {top && (
            <div className="top-category">
              <span>Kategori pengeluaran terbesar</span>
              <strong>{top.name}</strong>
              <b>{rupiah(top.amount)}</b>
            </div>
          )}
        </Panel>
      </div>
      {!report && (
        <Panel
          title="Transaksi Terakhir"
          action={
            <button
              className="text-button"
              onClick={() => onNavigate("Transaksi")}
            >
              Lihat semua ↗
            </button>
          }
        >
          <TransactionList
            data={data}
            rows={[...s.transactions]
              .sort(
                (a, b) =>
                  b.date.localeCompare(a.date) ||
                  b.createdAt.localeCompare(a.createdAt),
              )
              .slice(0, 5)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Panel>
      )}
      <p className="hint">
        Saldo = pemasukan − seluruh pengeluaran, termasuk alokasi tabungan dan
        investasi. Nilai investasi adalah modal tercatat, bukan harga pasar.
      </p>
    </>
  );
}
