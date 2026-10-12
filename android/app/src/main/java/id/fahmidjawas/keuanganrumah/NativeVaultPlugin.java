package id.fahmidjawas.keuanganrumah;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

@CapacitorPlugin(name = "NativeVault")
public class NativeVaultPlugin extends Plugin {
    private static final String ALIAS = "a_zuha_vault_biometric_v1";
    private static final String PREFS = "a_zuha_biometric_vault";

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private void ensureAvailable(PluginCall call) {
        int status = BiometricManager.from(getContext()).canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG);
        if (status != BiometricManager.BIOMETRIC_SUCCESS)
            throw new IllegalStateException("Biometrik kuat belum tersedia atau belum didaftarkan (kode " + status + "). Gunakan password/PIN.");
    }

    private SecretKey key(boolean create) throws Exception {
        KeyStore store = KeyStore.getInstance("AndroidKeyStore");
        store.load(null);
        SecretKey existing = (SecretKey) store.getKey(ALIAS, null);
        if (existing != null || !create) return existing;
        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(ALIAS,
            KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setUserAuthenticationRequired(true)
            .setUserAuthenticationValidityDurationSeconds(-1)
            .setInvalidatedByBiometricEnrollment(true)
            .build());
        return generator.generateKey();
    }

    private void prompt(PluginCall call, Cipher cipher, java.util.function.Consumer<Cipher> success) {
        getActivity().runOnUiThread(() -> {
            BiometricPrompt dialog = new BiometricPrompt((FragmentActivity) getActivity(),
                ContextCompat.getMainExecutor(getContext()), new BiometricPrompt.AuthenticationCallback() {
                    @Override public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                        Cipher authorized = result.getCryptoObject() == null ? null : result.getCryptoObject().getCipher();
                        if (authorized == null) { call.reject("Kunci biometrik tidak tersedia. Gunakan password/PIN."); return; }
                        try { success.accept(authorized); }
                        catch (Exception e) { call.reject("Kunci biometrik tidak dapat dibuka. Gunakan password/PIN."); }
                    }
                    @Override public void onAuthenticationError(int code, CharSequence message) {
                        call.reject("Biometrik dibatalkan atau gagal. Gunakan password/PIN.");
                    }
                });
            BiometricPrompt.PromptInfo info = new BiometricPrompt.PromptInfo.Builder()
                .setTitle("A-Zuha Finance")
                .setSubtitle("Buka data keuangan dengan biometrik")
                .setNegativeButtonText("Gunakan password/PIN")
                .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
                .build();
            dialog.authenticate(info, new BiometricPrompt.CryptoObject(cipher));
        });
    }

    @PluginMethod public void storeKey(PluginCall call) {
        String accountId = call.getString("accountId");
        String vaultKey = call.getString("key");
        if (accountId == null || accountId.isEmpty() || vaultKey == null || vaultKey.isEmpty()) {
            call.reject("Akun atau kunci vault tidak valid."); return;
        }
        try {
            ensureAvailable(call);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key(true));
            prompt(call, cipher, authorized -> {
                try {
                    byte[] encrypted = authorized.doFinal(vaultKey.getBytes(StandardCharsets.UTF_8));
                    prefs().edit().putString("accountId", accountId)
                        .putString("iv", Base64.encodeToString(authorized.getIV(), Base64.NO_WRAP))
                        .putString("cipher", Base64.encodeToString(encrypted, Base64.NO_WRAP)).apply();
                    call.resolve();
                } catch (Exception e) { call.reject("Gagal menyimpan kunci biometrik."); }
            });
        } catch (Exception e) { call.reject(e.getMessage()); }
    }

    @PluginMethod public void unlock(PluginCall call) {
        String accountId = call.getString("accountId");
        SharedPreferences stored = prefs();
        if (accountId == null || !accountId.equals(stored.getString("accountId", null))) {
            call.reject("Biometrik akun ini belum diaktifkan. Gunakan password/PIN."); return;
        }
        try {
            ensureAvailable(call);
            SecretKey secret = key(false);
            if (secret == null) throw new IllegalStateException("Kunci biometrik hilang. Gunakan password/PIN.");
            byte[] iv = Base64.decode(stored.getString("iv", ""), Base64.NO_WRAP);
            byte[] encrypted = Base64.decode(stored.getString("cipher", ""), Base64.NO_WRAP);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, secret, new GCMParameterSpec(128, iv));
            prompt(call, cipher, authorized -> {
                try {
                    String vaultKey = new String(authorized.doFinal(encrypted), StandardCharsets.UTF_8);
                    JSObject result = new JSObject();
                    result.put("key", vaultKey);
                    call.resolve(result);
                } catch (Exception e) { call.reject("Kunci biometrik tidak dapat dibuka. Gunakan password/PIN."); }
            });
        } catch (Exception e) { call.reject("Biometrik tidak tersedia. Gunakan password/PIN."); }
    }

    @PluginMethod public void remove(PluginCall call) {
        try {
            prefs().edit().clear().apply();
            KeyStore store = KeyStore.getInstance("AndroidKeyStore");
            store.load(null);
            if (store.containsAlias(ALIAS)) store.deleteEntry(ALIAS);
            call.resolve();
        } catch (Exception e) { call.reject("Gagal menghapus akses biometrik."); }
    }
}
