import { test, expect, type Page } from "@playwright/test";
const sizes = [
  [360, 800],
  [393, 852],
  [852, 393],
  [412, 915],
  [800, 1280],
  [1280, 800],
  [834, 1194],
  [1194, 834],
  [1366, 1024],
];
async function signup(p: Page) {
  await p.getByLabel("Username").fill("fahmi");
  await p.getByLabel("Password", { exact: true }).fill("Password-ku-2026");
  await p.getByLabel("PIN 6 digit").fill("123456");
  await p.getByRole("button", { name: "BUAT AKUN & MASUK" }).click();
  await expect(p.getByTestId("balance")).toBeVisible();
}
for (const [width, height] of sizes)
  test(`adaptive ${width}x${height}: login, navigation, cards, charts, form and rotation`, async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date("2026-10-07T12:00:00+07:00"));
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(
      page.getByRole("img", { name: "Ilustrasi keuangan keluarga" }),
    ).toBeVisible();
    await expect(
      page.getByText("DATA ANDA AMAN", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Lupa Password?" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sidik Jari", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await signup(page);
    // Exercise chart geometry with real ledger data, not just empty placeholders.
    await page
      .getByRole("button", { name: "Tambah transaksi", exact: true })
      .first()
      .click();
    await page.getByLabel("Nama transaksi").fill("Belanja layar adaptif");
    await page.getByLabel("Nominal (Rp)").fill("350000");
    await page.getByRole("button", { name: "SIMPAN TRANSAKSI" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("img", { name: "Komposisi per kategori" }),
    ).toBeVisible();
    const wide = width >= 840 && height > 500;
    await expect(page.locator(wide ? ".sidebar" : ".bottom-nav")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const selector of [
      ".hero",
      ".metric-wrap",
      ".panel",
      ".category-chart",
      ".bar-chart",
    ]) {
      const count = await page.locator(selector).count();
      for (let i = 0; i < count; i++) {
        const b = await page.locator(selector).nth(i).boundingBox();
        expect(b?.x).toBeGreaterThanOrEqual(0);
        expect((b?.x ?? 0) + (b?.width ?? 0)).toBeLessThanOrEqual(width + 1);
      }
    }
    await page
      .getByRole("button", { name: "Tambah transaksi", exact: true })
      .first()
      .click();
    await page.getByLabel("Nama transaksi").fill("Draft rotasi keluarga");
    await page.getByLabel("Nominal (Rp)").fill("123000");
    const amountBeforeRotation = await page
      .getByLabel("Nominal (Rp)")
      .inputValue();
    await page.setViewportSize({ width: height, height: width });
    await expect(page.getByLabel("Nama transaksi")).toHaveValue(
      "Draft rotasi keluarga",
    );
    await expect(page.getByLabel("Nominal (Rp)")).toHaveValue(
      amountBeforeRotation,
    );
    await page
      .getByRole("button", { name: "SIMPAN TRANSAKSI" })
      .scrollIntoViewIfNeeded();
    const b = await page
      .getByRole("button", { name: "SIMPAN TRANSAKSI" })
      .boundingBox();
    expect(b?.x).toBeGreaterThanOrEqual(0);
    expect((b?.x ?? 0) + (b?.width ?? 0)).toBeLessThanOrEqual(height);
    await page.getByRole("button", { name: "Tutup", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
test("Back closes form and returns to previous page without resetting data", async ({
  page,
}) => {
  await page.goto("/");
  await signup(page);
  await page
    .getByRole("button", { name: "Transaksi", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Tambah transaksi", exact: true })
    .first()
    .click();
  await page.getByLabel("Nama transaksi").fill("Draft");
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Transaksi", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId("balance")).toBeVisible();
});
test("safe areas and resized keyboard keep inputs and save reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await signup(page);
  await page.evaluate(() => {
    const root = document.documentElement;
    for (const [side, value] of Object.entries({
      top: 47,
      right: 24,
      bottom: 34,
      left: 24,
    }))
      root.style.setProperty(`--safe-area-inset-${side}`, `${value}px`);
  });
  const header = await page.locator(".page-title").boundingBox();
  expect(header!.y).toBeGreaterThanOrEqual(47);
  const nav = await page.locator(".bottom-nav").boundingBox();
  expect(nav!.height).toBeGreaterThanOrEqual(98);
  await page
    .getByRole("button", { name: "Tambah transaksi", exact: true })
    .first()
    .click();
  await page.getByLabel("Nama transaksi").fill("Keyboard aman");
  await page.setViewportSize({ width: 393, height: 440 });
  await expect(page.locator("html")).toHaveAttribute("data-keyboard", "open");
  await expect(page.locator(".bottom-nav")).toBeHidden();
  const save = page.getByRole("button", { name: "SIMPAN TRANSAKSI" });
  await save.scrollIntoViewIfNeeded();
  const box = await save.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(47);
  expect(box!.y + box!.height).toBeLessThanOrEqual(440 - 34);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("Back during confirmation write keeps the modal history intact", async ({
  page,
}) => {
  await page.goto("/");
  await signup(page);
  await page
    .getByRole("button", { name: "Tambah transaksi", exact: true })
    .first()
    .click();
  await page.getByLabel("Nama transaksi").fill("Uji Back sibuk");
  await page.getByLabel("Nominal (Rp)").fill("100000");
  await page.getByRole("button", { name: "SIMPAN TRANSAKSI" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Transaksi", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Hapus Uji Back sibuk" }).click();
  await page.evaluate(() => {
    const original = crypto.subtle.encrypt.bind(crypto.subtle);
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    Object.assign(window, { releaseWrite: release });
    crypto.subtle.encrypt = async (
      ...args: Parameters<SubtleCrypto["encrypt"]>
    ) => {
      await gate;
      return original(...args);
    };
  });
  await page.getByRole("button", { name: "Konfirmasi", exact: true }).click();
  await expect(page.getByRole("button", { name: "Memproses…" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect
    .poll(() => page.evaluate(() => Boolean(history.state?.krtModal)))
    .toBe(true);
  await page.evaluate(() => {
    (window as Window & { releaseWrite?: () => void }).releaseWrite?.();
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goBack();
  await expect(page.getByTestId("balance")).toBeVisible();
});
