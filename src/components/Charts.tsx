import { rupiah, monthLabel } from "../core/ledger";
import { Empty } from "./common";
const colors = [
  "#386cf3",
  "#eea745",
  "#8465db",
  "#20b18f",
  "#e66f80",
  "#56b9df",
  "#bd7fe4",
];
export function CategoriesChart({
  rows,
  centerLabel,
}: {
  centerLabel?: string;
  rows: { name: string; amount: number }[];
}) {
  const total = rows.reduce((s, r) => s + r.amount, 0);
  if (!total) return <Empty>Belum ada data kategori.</Empty>;
  let offset = 0;
  return (
    <div className="category-chart">
      <div className="donut">
        <svg
          viewBox="0 0 120 120"
          role="img"
          aria-label="Komposisi per kategori"
        >
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="var(--line)"
            strokeWidth="17"
          />
          {rows.map((r, i) => {
            const len = (r.amount / total) * 289;
            const o = offset;
            offset += len;
            return (
              <circle
                key={r.name}
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth="17"
                strokeDasharray={`${len} ${289 - len}`}
                strokeDashoffset={-o}
                transform="rotate(-90 60 60)"
              />
            );
          })}
        </svg>
        <div>
          <strong>{centerLabel ?? rows.length}</strong>
          <small>{centerLabel ? "modal" : "kategori"}</small>
        </div>
      </div>
      <div className="legend">
        {rows.map((r, i) => (
          <div key={r.name}>
            <span
              className="dot"
              style={{ background: colors[i % colors.length] }}
            />
            <span>
              {r.name}
              <small>{((r.amount / total) * 100).toFixed(1)}%</small>
            </span>
            <b>{rupiah(r.amount)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
export function TrendChart({
  rows,
}: {
  rows: { month: string; income: number; expense: number }[];
}) {
  const max = Math.max(1, ...rows.flatMap((r) => [r.income, r.expense]));
  return (
    <div>
      <div className="chart-key">
        <span>
          <i className="green-dot" />
          Pemasukan
        </span>
        <span>
          <i className="red-dot" />
          Pengeluaran
        </span>
      </div>
      <div className="bar-chart">
        {rows.map((r) => (
          <div className="bar-group" key={r.month}>
            <div className="bars">
              <div
                className="bar income"
                style={{ height: `${(r.income / max) * 100}%` }}
                title={rupiah(r.income)}
              />
              <div
                className="bar expense"
                style={{ height: `${(r.expense / max) * 100}%` }}
                title={rupiah(r.expense)}
              />
            </div>
            <span>{monthLabel(r.month).slice(0, 3)}</span>
            <small>
              {rupiah(r.income)} / {rupiah(r.expense)}
            </small>
          </div>
        ))}
      </div>
      <details>
        <summary>Data grafik</summary>
        <table>
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Pemasukan</th>
              <th>Pengeluaran</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.month}>
                <td>{monthLabel(r.month)}</td>
                <td>{rupiah(r.income)}</td>
                <td>{rupiah(r.expense)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
