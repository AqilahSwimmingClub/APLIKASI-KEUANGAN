import {
  dataSchema,
  transactionSchema,
  type Data,
  type Transaction,
} from "./model";
export { validDate } from "./model";
export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const previousMonth = (m: string) => shiftMonth(m, -1);
export const shiftMonth = (s: string, n: number) => {
  const [y, m] = s.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
export const monthLabel = (s: string) => {
  const [y, m] = s.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, 1));
};
export const change = (now: number, prev: number) =>
  prev === 0 ? (now === 0 ? 0 : null) : ((now - prev) / prev) * 100;
export const emptyData = (): Data => ({
  version: 1,
  categories: [
    ...["Gaji", "Honor", "Usaha", "Bonus", "Lainnya"].map((name, i) => ({
      id: `in-${i}`,
      name,
      type: "income" as const,
    })),
    ...[
      "Rumah Tangga",
      "Belanja",
      "Makan",
      "Transportasi",
      "Tagihan",
      "Pendidikan",
      "Kesehatan",
      "Hiburan",
      "Cicilan",
      "Lainnya",
    ].map((name, i) => ({ id: `out-${i}`, name, type: "expense" as const })),
  ],
  transactions: [],
  goals: [],
  investments: [],
  settings: { theme: "system", name: "FAHMI DJAWAS, S.Pd.", monthlyTarget: 0 },
});
export const summarize = (d: Data, month: string) => {
  const t = d.transactions.filter((t) => t.date.slice(0, 7) === month);
  const sum = (p: (t: Transaction) => boolean) =>
    t.filter(p).reduce((s, t) => s + t.amount, 0);
  const income = sum((t) => t.type === "income"),
    expense = sum((t) => t.type === "expense");
  return {
    income,
    expense,
    balance: income - expense,
    savings: sum((t) => t.allocation === "savings"),
    investment: sum((t) => t.allocation === "investment"),
    transactions: t,
  };
};
export const categoryTotals = (
  d: Data,
  month: string,
  type: "income" | "expense",
) =>
  d.categories
    .filter((c) => c.type === type)
    .map((c) => ({
      ...c,
      amount: d.transactions
        .filter(
          (t) =>
            t.date.startsWith(month) &&
            t.categoryId === c.id &&
            t.type === type,
        )
        .reduce((s, t) => s + t.amount, 0),
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
export const targetTotal = (d: Data, id: string) =>
  d.transactions
    .filter((t) => t.targetId === id)
    .reduce((s, t) => s + t.amount, 0);
export function putTransaction(
  d: Data,
  input: Transaction,
  checkTarget = true,
): Data {
  const t = transactionSchema.parse(input);
  const c = d.categories.find((c) => c.id === t.categoryId);
  if (!c || c.type !== t.type)
    throw Error("Kategori tidak sesuai jenis transaksi.");
  if (t.allocation !== "regular") {
    if (t.type !== "expense") throw Error("Alokasi harus pengeluaran.");
    const targets = t.allocation === "savings" ? d.goals : d.investments;
    if (checkTarget && !targets.some((g) => g.id === t.targetId))
      throw Error("Target tidak ditemukan.");
  } else if (t.targetId) throw Error("Transaksi biasa tidak memiliki target.");
  const transactions = [...d.transactions.filter((x) => x.id !== t.id), t];
  if (
    transactions.reduce((sum, t) => sum + t.amount, 0) > Number.MAX_SAFE_INTEGER
  )
    throw Error("Total ledger melebihi batas nominal aman.");
  return { ...d, transactions };
}
export const removeTransaction = (d: Data, id: string): Data => ({
  ...d,
  transactions: d.transactions.filter((t) => t.id !== id),
});
export function removeCategory(d: Data, id: string): Data {
  if (d.transactions.some((t) => t.categoryId === id))
    throw Error(
      "Kategori masih digunakan. Ubah kategori transaksi terlebih dahulu.",
    );
  return { ...d, categories: d.categories.filter((c) => c.id !== id) };
}
export function validateData(input: unknown): Data {
  const d = dataSchema.parse(input);
  if (new TextEncoder().encode(JSON.stringify(d)).byteLength > 12 * 1024 * 1024)
    throw Error(
      "Data terlalu besar (maksimal 12 MB sebelum enkripsi). Ekspor dan arsipkan transaksi sebelum menambah data.",
    );
  for (const a of [d.transactions, d.categories, d.goals, d.investments])
    if (new Set(a.map((x) => x.id)).size !== a.length)
      throw Error("ID duplikat dalam backup.");
  const targets = [...d.goals, ...d.investments];
  if (new Set(targets.map((t) => t.id)).size !== targets.length)
    throw Error("ID target bertabrakan.");
  if (
    d.transactions.reduce((sum, t) => sum + t.amount, 0) >
    Number.MAX_SAFE_INTEGER
  )
    throw Error("Total ledger melebihi batas nominal aman.");
  for (const t of d.transactions) putTransaction({ ...d, transactions: [] }, t);
  return d;
}
const csvCell = (s: string) =>
  `"${(/^[=+\-@\t\r]/.test(s) ? "'" : "") + s.replaceAll('"', '""')}"`;
export function exportCsv(d: Data, month?: string) {
  return (
    "\uFEFF" +
    [
      ["Tanggal", "Jenis", "Nama", "Kategori", "Nominal", "Alokasi", "Catatan"],
      ...d.transactions
        .filter((t) => !month || t.date.startsWith(month))
        .map((t) => [
          t.date,
          t.type === "income" ? "Pemasukan" : "Pengeluaran",
          t.title,
          d.categories.find((c) => c.id === t.categoryId)?.name ?? "",
          String(t.amount),
          t.allocation,
          t.note,
        ]),
    ]
      .map((r) => r.map(csvCell).join(";"))
      .join("\r\n")
  );
}
export function evaluations(d: Data, m: string) {
  const a = summarize(d, m),
    b = summarize(d, previousMonth(m));
  if (!a.transactions.length)
    return [
      "Belum ada transaksi bulan ini. Mulai catat untuk melihat evaluasi.",
    ];
  const result = (["income", "expense"] as const).map((k) => {
    const p = change(a[k], b[k]);
    const label = k === "income" ? "Pemasukan" : "Pengeluaran";
    return p === null
      ? `${label} ${rupiah(a[k])}; bulan sebelumnya belum memiliki nilai pembanding.`
      : `${label} ${p === 0 ? "tetap" : p > 0 ? "naik" : "turun"} ${Math.abs(p).toLocaleString("id-ID", { maximumFractionDigits: 1 })}% dibanding bulan sebelumnya.`;
  });
  const i = change(a.income, b.income),
    e = change(a.expense, b.expense);
  if (i !== null && e !== null && e > i)
    result.push("Pengeluaran meningkat lebih cepat dibandingkan pemasukan.");
  const top = categoryTotals(d, m, "expense")[0];
  if (top)
    result.push(`Pengeluaran terbesar: ${top.name}, ${rupiah(top.amount)}.`);
  if (a.balance < 0)
    result.push(
      "Pengeluaran melebihi pemasukan. Tinjau kebutuhan dan alokasi bulan ini.",
    );
  return result;
}
export function demoData(d: Data): Data {
  const now = new Date().toISOString();
  const rows: [string, number, string, "income" | "expense"][] = [
    ["Gaji Oktober", 10000000, "in-0", "income"],
    ["Belanja Rumah", 350000, "out-0", "expense"],
    ["Bensin Motor", 100000, "out-3", "expense"],
    ["Listrik", 250000, "out-4", "expense"],
    ["Uang Makan", 75000, "out-2", "expense"],
  ];
  let n = d;
  rows.forEach(([title, amount, categoryId, type], i) => {
    n = putTransaction(n, {
      id: crypto.randomUUID(),
      title,
      amount,
      categoryId,
      type,
      date: `2026-10-${String(7 - i).padStart(2, "0")}`,
      note: "Data demo",
      createdAt: now,
      updatedAt: now,
      allocation: "regular",
      demo: true,
    });
  });
  return n;
}

export const savingsEntries = (d: Data) =>
  d.transactions
    .filter((t) => t.allocation === "savings")
    .map((t) => ({
      id: t.id,
      transactionId: t.id,
      goalId: t.targetId!,
      date: t.date,
      amount: t.amount,
    }));
