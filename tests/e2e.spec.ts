import { test, expect, type Page } from "@playwright/test";
async function account(p: Page) {
  await p.goto("/");
  await p.getByLabel("Username").fill("fahmi");
  await p.getByLabel("Password", { exact: true }).fill("Password-ku-2026");
  await p.getByLabel("PIN 6 digit").fill("123456");
  await p.getByRole("button", { name: "BUAT AKUN & MASUK" }).click();
  await expect(p.getByText("SALDO BULAN INI")).toBeVisible();
}
async function add(p: Page, title: string, amount: string, type = "Pemasukan") {
  await p
    .getByRole("button", { name: "Tambah transaksi", exact: true })
    .first()
    .click();
  await p
    .getByLabel("Jenis", { exact: true })
    .selectOption(type === "Pemasukan" ? "income" : "expense");
  await p.getByLabel("Tanggal", { exact: true }).fill("2026-10-07");
  await p.getByLabel("Nama transaksi").fill(title);
  await p.getByLabel("Nominal (Rp)").fill(amount);
  await p.getByRole("button", { name: "SIMPAN TRANSAKSI" }).click();
  await expect(p.getByRole("dialog")).toHaveCount(0);
}
test("akun, transaksi CRUD, perbandingan, kategori, tabungan, investasi, backup dan restore", async ({
  page,
}) => {
  await account(page);
  await add(page, "Gaji Oktober", "10000000");
  await add(page, "Belanja Rumah", "350000", "Pengeluaran");
  await expect(page.getByTestId("balance")).toHaveText(/9.650.000/);
  await page
    .getByRole("button", { name: "Transaksi", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Edit Belanja Rumah" }).click();
  await page.getByLabel("Nominal (Rp)").fill("500000");
  await page.getByRole("button", { name: "SIMPAN TRANSAKSI" }).click();
  await page
    .getByRole("button", { name: "Laporan", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("Pengeluaran terbesar: Rumah Tangga, Rp 500.000.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/Pengeluaran terbesar: Rumah Tangga/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Tabungan", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Tambah target" }).click();
  await page.getByLabel("Nama target").fill("Dana Darurat");
  await page.getByLabel("Target (Rp)").fill("5000000");
  await page.getByRole("button", { name: "Simpan target" }).click();
  await page.getByRole("button", { name: "Setor Dana Darurat" }).click();
  await page.getByLabel("Nominal (Rp)").fill("1000000");
  await page.getByRole("button", { name: "SIMPAN TRANSAKSI" }).click();
  await expect(page.getByText("20%")).toBeVisible();
  await page
    .getByRole("button", { name: "Investasi", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Tambah investasi" }).click();
  await page.getByLabel("Nama investasi").fill("Emas keluarga");
  await page.getByRole("button", { name: "Simpan investasi" }).click();
  await page.getByRole("button", { name: "Tambah dana Emas keluarga" }).click();
  await page.getByLabel("Nominal (Rp)").fill("500000");
  await page.getByRole("button", { name: "SIMPAN TRANSAKSI" }).click();
  await page
    .getByRole("button", { name: "Dashboard", exact: true })
    .first()
    .click();
  await expect(page.getByTestId("balance")).toHaveText(/8.000.000/);
  await page
    .getByRole("button", { name: "Pengaturan", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Backup & Restore", exact: true })
    .click();
  await page.getByLabel("Password backup").fill("Backup-aman-2026");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Unduh backup" }).click();
  const path = await (await download).path();
  expect(path).toBeTruthy();
  await page.getByLabel("Pilih file backup").setInputFiles(path!);
  await page.getByRole("button", { name: "Validasi backup" }).click();
  await expect(page.getByRole("dialog")).toContainText("4 transaksi");
  await page.getByRole("button", { name: "Pulihkan data" }).click();
  await expect(page.getByText("Backup dipulihkan")).toBeVisible();
  await page.getByRole("button", { name: "Keluar", exact: true }).click();
  await page.getByLabel("Username").fill("fahmi");
  await page.getByLabel("Password", { exact: true }).fill("salah");
  await page.getByRole("button", { name: "MASUK", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("salah");
  await page.getByLabel("Password", { exact: true }).fill("Password-ku-2026");
  await page.getByRole("button", { name: "MASUK", exact: true }).click();
  await expect(page.getByTestId("balance")).toHaveText(/8.000.000/);
});
test("responsive, offline dan data persisten", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await account(page);
  await add(page, "Gaji Oktober", "1000000");
  for (const size of [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(size);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await page.getByLabel("Username").fill("fahmi");
  await page.getByLabel("Password", { exact: true }).fill("Password-ku-2026");
  await page.getByRole("button", { name: "MASUK", exact: true }).click();
  await expect(page.getByTestId("balance")).toHaveText(/1.000.000/);
});

test("hapus dengan konfirmasi, kategori custom, filter, ekspor dan backup rusak aman", async ({
  page,
}) => {
  await account(page);
  await add(page, "Gaji uji", "2000000");
  await add(page, "Belanja uji", "200000", "Pengeluaran");
  await page
    .getByRole("button", { name: "Transaksi", exact: true })
    .first()
    .click();
  await page.getByLabel("Cari transaksi").fill("Belanja");
  await expect(page.getByText("Gaji uji", { exact: true })).toHaveCount(0);
  await page.getByLabel("Cari transaksi").fill("");
  await page.getByRole("button", { name: "Hapus Belanja uji" }).click();
  await page.getByRole("button", { name: "Batal", exact: true }).click();
  await expect(page.getByText("Belanja uji", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Hapus Belanja uji" }).click();
  await page.getByRole("button", { name: "Konfirmasi", exact: true }).click();
  await expect(page.getByText("Belanja uji", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Pengaturan", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Kategori", exact: true }).click();
  await page.getByRole("button", { name: "Tambah kategori" }).click();
  await page.getByLabel("Nama kategori").fill("Kebutuhan khusus");
  await page.getByRole("button", { name: "Simpan kategori" }).click();
  await expect(
    page.getByText("Kebutuhan khusus", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit kategori Kebutuhan khusus" })
    .click();
  await page.getByLabel("Nama kategori").fill("Kebutuhan keluarga");
  await page.getByRole("button", { name: "Simpan kategori" }).click();
  await page
    .getByRole("button", { name: "Hapus kategori Kebutuhan keluarga" })
    .click();
  await page.getByRole("button", { name: "Konfirmasi", exact: true }).click();
  await expect(
    page.getByText("Kebutuhan keluarga", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Hapus kategori Gaji", exact: true })
    .click();
  await page.getByRole("button", { name: "Konfirmasi", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "masih digunakan",
  );
  await page.getByRole("button", { name: "Batal", exact: true }).click();
  await page
    .getByRole("button", { name: "Backup & Restore", exact: true })
    .click();
  await page.getByLabel("Password backup").fill("Backup-aman-2026");
  await page
    .getByLabel("Pilih file backup")
    .setInputFiles({
      name: "rusak.json",
      mimeType: "application/json",
      buffer: Buffer.from("{broken"),
    });
  await page.getByRole("button", { name: "Validasi backup" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Export Data", exact: true }).click();
  let pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export semua transaksi CSV" })
    .click();
  expect((await pending).suggestedFilename()).toBe("semua-transaksi.csv");
  pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF laporan" }).click();
  expect((await pending).suggestedFilename()).toBe("laporan-2026-10.pdf");
  await page
    .getByRole("button", { name: "Dashboard", exact: true })
    .first()
    .click();
  await expect(page.getByTestId("balance")).toHaveText(/2.000.000/);
});
test("PIN, ingat saya, keamanan akun dan tema", async ({ page }) => {
  await account(page);
  await page
    .getByRole("button", { name: "Pengaturan", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Tema Aplikasi", exact: true })
    .click();
  await page.getByLabel("Tema", { exact: true }).selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Keamanan Akun", exact: true })
    .click();
  await page.getByLabel("Password saat ini").fill("Password-ku-2026");
  await page
    .getByLabel("Password baru", { exact: true })
    .fill("Password-baru-2026");
  await page.getByLabel("Konfirmasi password baru").fill("Password-baru-2026");
  await page.getByLabel("PIN baru").fill("654321");
  await page.getByRole("button", { name: "Simpan keamanan" }).click();
  await expect(page.getByText("Keamanan akun diperbarui")).toBeVisible();
  await page.getByRole("button", { name: "Keluar", exact: true }).click();
  await page.getByRole("button", { name: "Masuk dengan PIN" }).click();
  await page.getByLabel("PIN 6 digit").fill("654321");
  await page.getByLabel("Ingat Saya").check();
  await page.getByRole("button", { name: "MASUK", exact: true }).click();
  await expect(page.getByTestId("balance")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("balance")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
