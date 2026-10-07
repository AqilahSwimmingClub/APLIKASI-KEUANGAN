import { test, expect } from "vitest";
import {
  createAccount,
  unlockAccount,
  rewrap,
  seal,
  unseal,
} from "../src/core/vault";
import { emptyData } from "../src/core/ledger";
for (const password of [
  "1",
  "12",
  "1234",
  "123456",
  "abc",
  "ABC",
  "Fahmi",
  "fahmi123",
  "@123",
  "fahmi",
  "FAHMI",
  "ABC123",
  "Ab",
]) {
  test(`accepts exact nonempty password ${password} for account, change and backup`, async () => {
    const created = await createAccount("pemilik", password, "123456");
    expect(await unlockAccount(created.record, password)).toBe(created.key);
    const changed = await rewrap(
      created.record,
      created.key,
      password,
      "123456",
    );
    expect(await unlockAccount(changed, password)).toBe(created.key);
    expect(await unseal(await seal(emptyData(), password), password)).toEqual(
      emptyData(),
    );
  });
}
test("rejects empty account/change/backup password and malformed PIN", async () => {
  await expect(createAccount("pemilik", "")).rejects.toThrow();
  const a = await createAccount("pemilik", "valid-password");
  await expect(rewrap(a.record, a.key, "")).rejects.toThrow();
  await expect(seal(emptyData(), "")).rejects.toThrow();
  for (const pin of ["1", "12345", "1234567", "abc123"])
    await expect(
      createAccount("pemilik", "valid-password", pin),
    ).rejects.toThrow(/PIN/);
});
