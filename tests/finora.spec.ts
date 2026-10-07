import { test, expect } from "@playwright/test";

async function createOwner(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "BUAT AKUN PEMILIK" })).toBeVisible();
  await page.getByLabel("Username", { exact: true }).fill("finora-owner");
  await page.getByLabel("Password", { exact: true }).fill("1");
  await page.getByLabel("Konfirmasi Password", { exact: true }).fill("1");
  await page.getByLabel("PIN 6 digit", { exact: true }).fill("123456");
  await page.getByLabel("Konfirmasi PIN 6 digit", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "BUAT AKUN", exact: true }).click();
  await expect(page.getByTestId("balance")).toBeVisible();
}

test("FINORA owner, login focus and password reveal", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "FINORA" })).toBeVisible();
  await expect(page.getByText("Keuangan Keluarga", { exact: true })).toBeVisible();
  await createOwner(page);
  await page.reload();
  const field = page.getByLabel("Password", { exact: true });
  await field.focus();
  const style = await field.evaluate((el) => {
    const input = getComputedStyle(el), wrapper = getComputedStyle(el.parentElement!);
    return { outline: input.outlineStyle, caret: input.caretColor, shadow: wrapper.boxShadow, border: wrapper.borderColor };
  });
  expect(style.outline).toBe("none");
  expect(style.shadow).not.toBe("none");
  expect(style.caret).toBe("rgb(0, 106, 255)");
  await field.fill("1");
  await page.getByRole("button", { name: "Tampilkan password" }).click();
  await expect(field).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Sembunyikan password" }).click();
  await expect(field).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "MASUK", exact: true }).click();
  await expect(page.getByTestId("balance")).toBeVisible();
  await expect(page.getByRole("heading", { name: "FINORA" })).toBeVisible();
});

test("tablet landscape centers login and pairs compact dashboard sections", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 1024 });
  await page.goto("/");
  const layout = await page.locator(".baseline-login").evaluate((root) => {
    const identity = root.querySelector(".login-identity")!.getBoundingClientRect();
    const card = root.querySelector(".login-main")!.getBoundingClientRect();
    return { left: identity.left, right: card.right, identityRight: identity.right, cardLeft: card.left, cardWidth: card.width };
  });
  expect(layout.left).toBeGreaterThan(100);
  expect(layout.right).toBeLessThan(1266);
  expect(layout.cardLeft).toBeGreaterThan(layout.identityRight);
  expect(layout.cardWidth).toBeLessThanOrEqual(520);
  await createOwner(page);
  const metrics = await page.locator(".metric-wrap").evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
  expect(new Set(metrics).size).toBe(1);
  const emptyChart = page.locator(".dashboard-income-expense");
  await expect(emptyChart.locator(".empty")).toBeVisible();
  expect((await emptyChart.boundingBox())?.height).toBeLessThan(180);
  const panels = await page.locator(".dashboard-grid > .panel").evaluateAll((els) => els.map((el) => ({title: el.querySelector("h2")?.textContent, top: Math.round(el.getBoundingClientRect().top)})));
  expect(panels.find((p) => p.title === "Pemasukan vs Pengeluaran")?.top).toBe(panels.find((p) => p.title === "Pengeluaran per Kategori")?.top);
  expect(panels.find((p) => p.title === "Tren Keuangan • 6 Bulan")?.top).toBe(panels.find((p) => p.title === "Evaluasi Keuangan")?.top);
  await expect(page.locator(".bottom-nav")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("transaction and backup inputs use the same accessible custom focus", async ({ page }) => {
  await createOwner(page);
  await page.getByRole("button", { name: "Tambah transaksi", exact: true }).first().click();
  const amount = page.getByLabel("Nominal (Rp)");
  await amount.focus();
  const formStyle = await amount.evaluate((el) => ({
    outline: getComputedStyle(el).outlineStyle,
    shadow: getComputedStyle(el.parentElement!).boxShadow,
  }));
  expect(formStyle.outline).toBe("none");
  expect(formStyle.shadow).not.toBe("none");
  await page.getByRole("button", { name: "Tutup" }).click();
  await page.getByRole("button", { name: "Pengaturan", exact: true }).click();
  await page.getByRole("button", { name: "Backup & Restore" }).click();
  const backup = page.getByLabel("Password backup");
  await backup.focus();
  const backupStyle = await backup.evaluate((el) => ({
    outline: getComputedStyle(el).outlineStyle,
    shadow: getComputedStyle(el.parentElement!).boxShadow,
  }));
  expect(backupStyle.outline).toBe("none");
  expect(backupStyle.shadow).not.toBe("none");
});

for (const [width, height] of [
  [360, 800], [393, 852], [412, 915], [430, 932],
  [800, 360], [852, 393], [915, 412],
  [768, 1024], [800, 1280], [834, 1194],
  [1024, 768], [1194, 834], [1280, 800], [1366, 1024],
]) {
  test(`FINORA login, owner, focus, keyboard and dashboard ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "FINORA" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "BUAT AKUN PEMILIK" })).toBeVisible();
    const username = page.getByLabel("Username", { exact: true });
    await username.focus();
    const inputStyle = await username.evaluate((el) => ({
      outline: getComputedStyle(el).outlineStyle,
      shadow: getComputedStyle(el.parentElement!).boxShadow,
    }));
    expect(inputStyle.outline).toBe("none");
    expect(inputStyle.shadow).not.toBe("none");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("html").evaluate((el) => { el.dataset.keyboard = "open"; });
    await page.setViewportSize({ width, height: Math.max(280, Math.floor(height * 0.65)) });
    const password = page.getByLabel("Password", { exact: true });
    await password.focus();
    await password.scrollIntoViewIfNeeded();
    const bounds = await password.boundingBox();
    expect(bounds?.x).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width + 1);
    expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(Math.max(280, Math.floor(height * 0.65)) + 2);
    await page.locator("html").evaluate((el) => { el.dataset.keyboard = "closed"; });
    await page.setViewportSize({ width, height });
    await createOwner(page);
    await expect(page.getByRole("heading", { name: "FINORA" })).toBeVisible();
    await expect(page.locator(".bottom-nav")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
