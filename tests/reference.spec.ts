import { test, expect } from "@playwright/test";
test("owner setup confirms credentials and returns to normal login on restart", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "BUAT AKUN PEMILIK" }),
  ).toBeVisible();
  await page.getByLabel("Username", { exact: true }).fill("pemilik");
  await page.getByLabel("Password", { exact: true }).fill("1");
  await page.getByLabel("Konfirmasi Password", { exact: true }).fill("2");
  await page.getByLabel("PIN 6 digit", { exact: true }).fill("123456");
  await page
    .getByLabel("Konfirmasi PIN 6 digit", { exact: true })
    .fill("123456");
  await page.getByRole("button", { name: "BUAT AKUN", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Konfirmasi password");
  await page.getByLabel("Konfirmasi Password", { exact: true }).fill("1");
  await page
    .getByLabel("Konfirmasi PIN 6 digit", { exact: true })
    .fill("654321");
  await page.getByRole("button", { name: "BUAT AKUN", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Konfirmasi PIN");
  await page
    .getByLabel("Konfirmasi PIN 6 digit", { exact: true })
    .fill("123456");
  await page.getByRole("button", { name: "BUAT AKUN", exact: true }).click();
  await expect(page.getByTestId("balance")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "MASUK", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "BUAT AKUN PEMILIK" }),
  ).toHaveCount(0);
  await page.getByLabel("Password", { exact: true }).fill("1");
  await page.getByRole("button", { name: "MASUK", exact: true }).click();
  await expect(page.getByTestId("balance")).toBeVisible();
});

test("tablet keeps bottom navigation, filter sheet and report tabs", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByLabel("Username", { exact: true }).fill("pemilik");
  await page.getByLabel("Password", { exact: true }).fill("abc");
  await page.getByLabel("Konfirmasi Password", { exact: true }).fill("abc");
  await page.getByLabel("PIN 6 digit", { exact: true }).fill("123456");
  await page
    .getByLabel("Konfirmasi PIN 6 digit", { exact: true })
    .fill("123456");
  await page.getByRole("button", { name: "BUAT AKUN", exact: true }).click();
  await expect(page.getByTestId("balance")).toBeVisible();
  await expect(page.locator("aside")).toHaveCount(0);
  await expect(page.locator(".bottom-nav")).toBeVisible();
  await page.getByRole("button", { name: "Transaksi", exact: true }).click();
  await expect(page.getByLabel("Filter bulan dan tahun")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Filter transaksi", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("Filter bulan dan tahun")).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Laporan", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Ringkasan", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tren", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Tren Keuangan • 6 Bulan" }),
  ).toBeVisible();
});
