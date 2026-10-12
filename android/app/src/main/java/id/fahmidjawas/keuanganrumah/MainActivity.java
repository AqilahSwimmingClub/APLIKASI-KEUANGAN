package id.fahmidjawas.keuanganrumah;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeVaultPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
