import { Capacitor, registerPlugin } from "@capacitor/core";

interface NativeVaultPlugin {
  storeKey(options: { accountId: string; key: string }): Promise<void>;
  unlock(options: { accountId: string }): Promise<{ key: string }>;
  remove(): Promise<void>;
}

export const nativeVaultAvailable = () => Capacitor.isNativePlatform();
export const NativeVault = registerPlugin<NativeVaultPlugin>("NativeVault");
