import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-12T12:00:00+07:00"));
});

async function signup(page: Page) {
  await page.goto("/");
  await page.getByLabel("Username").fill("fahmi");
  await page.getByLabel("Password", { exact: true }).fill("Password-ku-2026");
  await page.getByLabel("Konfirmasi Password").fill("Password-ku-2026");
  await page.getByLabel("PIN 6 digit", { exact: true }).fill("123456");
  await page.getByLabel("Konfirmasi PIN 6 digit").fill("123456");
  await page.getByRole("button", { name: "BUAT AKUN" }).click();
}
async function navigate(page: Page, name: string) {
  await page.getByRole("button", { name, exact: true }).first().click();
}
async function income(page: Page) {
  await page
    .getByRole("button", { name: "Tambah transaksi", exact: true })
    .first()
    .click();
  await page.getByLabel("Jenis", { exact: true }).selectOption("income");
  await page.getByLabel("Nama transaksi").fill("Gaji");
  await page.getByLabel("Nominal (Rp)").fill("900000");
  await page.getByRole("button", { name: "SIMPAN TRANSAKSI" }).click();
}
const kpi = (page: Page, name: string) =>
  page
    .locator(".metric")
    .filter({ has: page.getByText(name, { exact: true }) })
    .locator("strong");

test("setoran langsung, persistensi, edit dan hapus memperbarui semua angka", async ({
  page,
}) => {
  await signup(page);
  await income(page);
  await expect(page.getByTestId("balance")).toContainText("900.000");
  await expect(kpi(page, "Tabungan")).toContainText("0");
  await navigate(page, "Tabungan");
  await expect(page.getByText("Tabungan Umum", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "TAMBAH SETORAN", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "TAMBAH SETORAN TABUNGAN",
  );
  await expect(page.getByLabel("Target Tabungan")).toHaveValue(
    "system-general-savings",
  );
  await expect(page.getByLabel("Nominal", { exact: true })).toHaveAttribute(
    "inputmode",
    "numeric",
  );
  await page.getByLabel("Nominal", { exact: true }).fill("-100");
  await expect(page.getByLabel("Nominal", { exact: true })).toBeEmpty();
  await page.getByLabel("Nominal", { exact: true }).fill("200000");
  await page.getByRole("button", { name: "SIMPAN SETORAN" }).click();
  await expect(page.locator(".asset-hero")).toContainText("200.000");
  await expect(
    page.getByRole("button", { name: "Edit Setoran Tabungan Umum" }),
  ).toBeVisible();
  await expect(page.locator(".transaction-list")).toContainText("+Rp");
  await navigate(page, "Dashboard");
  await expect(kpi(page, "Pemasukan")).toContainText("900.000");
  await expect(kpi(page, "Pengeluaran")).toContainText("0");
  await expect(kpi(page, "Tabungan")).toContainText("200.000");
  await expect(page.getByTestId("balance")).toContainText("700.000");
  await page.reload();
  await page.getByLabel("Password", { exact: true }).fill("Password-ku-2026");
  await page.getByRole("button", { name: "MASUK", exact: true }).click();
  await expect(page.getByTestId("balance")).toContainText("700.000");
  await navigate(page, "Tabungan");
  await expect(page.locator(".asset-hero")).toContainText("200.000");
  await page
    .getByRole("button", { name: "Edit Setoran Tabungan Umum" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("EDIT SETORAN");
  await page.getByLabel("Nominal", { exact: true }).fill("250000");
  await page.getByRole("button", { name: "SIMPAN SETORAN" }).click();
  await expect(page.locator(".asset-hero")).toContainText("250.000");
  await navigate(page, "Dashboard");
  await expect(page.getByTestId("balance")).toContainText("650.000");
  await navigate(page, "Tabungan");
  await page
    .getByRole("button", { name: "Hapus Setoran Tabungan Umum" })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    /Hapus setoran tabungan Rp\s*250.000\?/,
  );
  await page.getByRole("button", { name: "Konfirmasi" }).click();
  await expect(page.locator(".asset-hero")).toContainText("0");
  await navigate(page, "Dashboard");
  await expect(page.getByTestId("balance")).toContainText("900.000");
});

test("FAB menyediakan Tabungan dan setoran lintas bulan tetap kumulatif", async ({
  page,
}) => {
  await signup(page);
  await income(page);
  await page
    .getByRole("button", { name: "Tambah transaksi", exact: true })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Tabungan", exact: true })
    .click();
  await page.getByLabel("Tanggal").fill("2026-09-20");
  await page.getByLabel("Nominal", { exact: true }).fill("300000");
  await page.getByRole("button", { name: "SIMPAN SETORAN" }).click();
  await expect(kpi(page, "Tabungan")).toContainText("0");
  await expect(page.getByTestId("balance")).toContainText("900.000");
  await navigate(page, "Tabungan");
  await expect(page.locator(".asset-hero")).toContainText("300.000");
  await page
    .getByRole("button", { name: "TAMBAH SETORAN", exact: true })
    .click();
  await page.getByLabel("Nominal", { exact: true }).fill("200000");
  await page.getByRole("button", { name: "SIMPAN SETORAN" }).click();
  await expect(page.locator(".asset-hero")).toContainText("500.000");
  await navigate(page, "Dashboard");
  await expect(kpi(page, "Tabungan")).toContainText("200.000");
  await expect(kpi(page, "Pengeluaran")).toContainText("0");
  await expect(page.getByTestId("balance")).toContainText("700.000");
});
