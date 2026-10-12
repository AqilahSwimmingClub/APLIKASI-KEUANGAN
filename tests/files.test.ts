import { expect, test, vi } from "vitest";

const calls = vi.hoisted(() => ({
  write: [] as Array<{ path: string; data: string; directory: string; recursive: boolean }>,
  share: [] as Array<{ title: string; url: string }>,
  failDocuments: false,
}));
vi.mock("@capacitor/core", () => ({ Capacitor: { isNativePlatform: () => true } }));
vi.mock("@capacitor/filesystem", () => ({
  Directory: { Documents: "DOCUMENTS", Cache: "CACHE" },
  Filesystem: {
    writeFile: async (options: { path: string; data: string; directory: string; recursive: boolean }) => {
      calls.write.push(options);
      if (calls.failDocuments && options.directory === "DOCUMENTS") throw Error("Documents unavailable");
      return { uri: `file:///storage/emulated/0/Documents/${options.path}` };
    },
  },
}));
vi.mock("@capacitor/share", () => ({
  Share: { share: async (options: { title: string; url: string }) => { calls.share.push(options); } },
}));

test("ekspor native menyimpan PDF permanen lalu membagikan URI berkasnya", async () => {
  const { saveFile } = await import("../src/core/files");
  await saveFile(new TextEncoder().encode("%PDF-1.7\n").buffer, "laporan-2026-10.pdf", "application/pdf");
  expect(calls.write).toHaveLength(1);
  expect(calls.write[0].directory).toBe("DOCUMENTS");
  expect(calls.write[0].path).toMatch(/^exports\/\d+-laporan-2026-10\.pdf$/);
  expect(atob(calls.write[0].data)).toBe("%PDF-1.7\n");
  expect(calls.share[0].url).toContain(calls.write[0].path);
});

test("ekspor native tetap membuka share sheet jika Documents tidak tersedia", async () => {
  calls.write.length = 0;
  calls.share.length = 0;
  calls.failDocuments = true;
  const { saveFile } = await import("../src/core/files");
  await saveFile(new TextEncoder().encode("%PDF-1.7\n").buffer, "laporan-2026-10.pdf", "application/pdf");
  expect(calls.write.map((call) => call.directory)).toEqual(["DOCUMENTS", "CACHE"]);
  expect(calls.share).toHaveLength(1);
  calls.failDocuments = false;
});
