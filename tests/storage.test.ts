import "fake-indexeddb/auto";
import { test, expect, beforeEach } from "vitest";
import { IDBFactory } from "fake-indexeddb";
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});
import {
  createAccount,
  createVault,
  readData,
  saveData,
  loadAccount,
  rewrap,
  unlockAccount,
  saveAccount,
} from "../src/core/vault";
import { emptyData, putTransaction } from "../src/core/ledger";
test("vault persisten; restore invalid tidak mengubah data aktif", async () => {
  const a = await createAccount("user", "Password-ku-2026");
  const d = putTransaction(emptyData(), {
    id: "t",
    type: "income",
    date: "2026-10-07",
    title: "Gaji",
    categoryId: "in-0",
    amount: 500,
    note: "",
    allocation: "regular",
    createdAt: "x",
    updatedAt: "x",
  });
  await createVault(a.record, d, a.key);
  expect((await loadAccount())?.username).toBe("user");
  expect(await readData(a.key)).toEqual(d);
  await expect(
    saveData({ ...d, version: 8 } as unknown as typeof d, a.key),
  ).rejects.toThrow();
  expect(await readData(a.key)).toEqual(d);
  await saveData(emptyData(), a.key);
  expect((await readData(a.key)).transactions).toHaveLength(0);
});
test("ubah password mempertahankan data dan membatalkan password lama", async () => {
  const a = await createAccount("user", "Password-ku-2026");
  await createVault(a.record, emptyData(), a.key);
  const newAccount = await rewrap(
    a.record,
    a.key,
    "Password-baru-2026",
    "654321",
  );
  await saveAccount(newAccount);
  await expect(unlockAccount(newAccount, "Password-ku-2026")).rejects.toThrow();
  const key = await unlockAccount(newAccount, "Password-baru-2026");
  expect(await readData(key)).toEqual(emptyData());
});

test("tab lama tidak menimpa data yang ditulis tab lain", async () => {
  const a = await createAccount("user", "Password-ku-2026");
  await createVault(a.record, emptyData(), a.key);
  await readData(a.key);
  const { openDB } = await import("idb");
  const db = await openDB("krt-secure", 1);
  const current = await db.get("vault", "data");
  await db.put(
    "vault",
    { ...current, cipher: current.cipher + "external" },
    "data",
  );
  await expect(saveData(emptyData(), a.key)).rejects.toThrow("Data berubah");
});

test("tab lama tidak mengembalikan password lama setelah keamanan diubah", async () => {
  const a = await createAccount("user", "Password-ku-2026");
  await createVault(a.record, emptyData(), a.key);
  await loadAccount();
  const { openDB } = await import("idb");
  const db = await openDB("krt-secure", 1);
  const newer = await rewrap(a.record, a.key, "Password-baru-2026");
  await db.put("vault", newer, "account");
  await expect(saveAccount({ ...a.record, bio: undefined })).rejects.toThrow(
    "Keamanan akun berubah",
  );
});
test("tab pendaftaran lama tidak menimpa akun dan data aktif", async () => {
  const a = await createAccount("user", "Password-ku-2026");
  await createVault(a.record, emptyData(), a.key);
  const b = await createAccount("other", "Password-lain-2026");
  await expect(createVault(b.record, emptyData(), b.key)).rejects.toThrow(
    "Akun sudah dibuat",
  );
  expect((await loadAccount())?.username).toBe("user");
  expect(await readData(a.key)).toEqual(emptyData());
});

test("batas ukuran mencegah data tersimpan yang tak dapat dibuka atau dibackup", async () => {
  const a = await createAccount("user", "Password-ku-2026");
  const d = emptyData();
  await createVault(a.record, d, a.key);
  const huge = {
    ...d,
    transactions: Array.from({ length: 7000 }, (_, i) => ({
      id: String(i),
      type: "income" as const,
      date: "2026-10-07",
      title: "Gaji",
      categoryId: "in-0",
      amount: 1,
      note: "x".repeat(2000),
      allocation: "regular" as const,
      createdAt: "x",
      updatedAt: "x",
    })),
  };
  await expect(saveData(huge, a.key)).rejects.toThrow("terlalu besar");
  expect(await readData(a.key)).toEqual(d);
});
