import { expect, test, vi } from "vitest";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { emptyData, putTransaction } from "../src/core/ledger";
import { exportPdf } from "../src/pages/Overview";

const saved = vi.hoisted(() => ({ bytes: new Uint8Array(), name: "", type: "" }));
vi.mock("../src/core/files", () => ({
  saveFile: async (content: ArrayBuffer, name: string, type: string) => {
    saved.bytes = new Uint8Array(content);
    saved.name = name;
    saved.type = type;
  },
}));

async function parsedPdf() {
  expect(new TextDecoder().decode(saved.bytes.slice(0, 5))).toBe("%PDF-");
  const pdf = await getDocument({ data: saved.bytes.slice(), useSystemFonts: true }).promise;
  const pages: string[] = [];
  for (let index = 1; index <= pdf.numPages; index++) {
    const page = await pdf.getPage(index);
    pages.push((await page.getTextContent()).items.map((item) => "str" in item ? item.str : "").join(" "));
  }
  return { pdf, text: pages.join("\n") };
}

test("PDF kosong dapat dibuka parser dan memuat ringkasan lengkap", async () => {
  await exportPdf(emptyData(), "2026-10");
  expect(saved.name).toBe("laporan-2026-10.pdf");
  expect(saved.type).toBe("application/pdf");
  const { pdf, text } = await parsedPdf();
  expect(pdf.numPages).toBeGreaterThan(0);
  expect(text).toContain("A-Zuha Finance");
  expect(text).toContain("Oktober 2026");
  expect(text).toContain("Total Pemasukan");
  expect(text).toContain("Total Pengeluaran");
  expect(text).toContain("Saldo");
  expect(text).toContain("FAHMI DJAWAS, S.Pd.");
  await pdf.destroy();
});

test("PDF banyak transaksi tidak kehilangan baris ketika berganti halaman", async () => {
  let data = emptyData();
  for (let i = 0; i < 85; i++) {
    data = putTransaction(data, {
      id: `pdf-${i}`,
      type: "income",
      date: "2026-10-07",
      title: `Transaksi PDF ${String(i).padStart(2, "0")}`,
      categoryId: "in-0",
      amount: 100000 + i,
      note: "",
      allocation: "regular",
      createdAt: "2026-10-07T00:00:00.000Z",
      updatedAt: "2026-10-07T00:00:00.000Z",
    });
  }
  await exportPdf(data, "2026-10");
  const { pdf, text } = await parsedPdf();
  expect(pdf.numPages).toBeGreaterThan(1);
  expect(text).toContain("Rp 8.503.570");
  expect(text).toContain("Transaksi PDF 00");
  expect(text).toContain("Transaksi PDF 84");
  await pdf.destroy();
});
