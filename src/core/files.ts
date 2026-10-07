import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
export async function saveFile(content: BlobPart, name: string, type: string) {
  const blob = new Blob([content], { type });
  if (Capacitor.isNativePlatform()) {
    const b = new Uint8Array(await blob.arrayBuffer());
    let s = "";
    for (const byte of b) s += String.fromCharCode(byte);
    const file = await Filesystem.writeFile({
      path: `exports/${Date.now()}-${name}`,
      data: btoa(s),
      directory: Directory.Cache,
      recursive: true,
    });
    await Share.share({
      title: name,
      url: file.uri,
      dialogTitle: "Simpan atau bagikan berkas",
    });
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
