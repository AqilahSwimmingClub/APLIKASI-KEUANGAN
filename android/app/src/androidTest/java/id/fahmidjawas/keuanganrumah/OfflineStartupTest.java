package id.fahmidjawas.keuanganrumah;

import static org.junit.Assert.*;
import android.content.pm.ActivityInfo;
import android.os.Environment;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.espresso.Espresso;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;

/** Runs on an emulator with Wi-Fi and cellular disabled before starting instrumentation. */
@RunWith(AndroidJUnit4.class)
public class OfflineStartupTest {
    private String evaluate(ActivityScenario<MainActivity> scenario, String script) throws Exception {
        AtomicReference<String> value = new AtomicReference<>();
        CountDownLatch latch = new CountDownLatch(1);
        scenario.onActivity(a -> a.getBridge().getWebView().evaluateJavascript(script, result -> {value.set(result);latch.countDown();}));
        assertTrue("WebView callback",latch.await(10,TimeUnit.SECONDS));
        return value.get();
    }
    private void until(ActivityScenario<MainActivity> scenario, String script) throws Exception {
        long end=System.currentTimeMillis()+60000;
        while(System.currentTimeMillis()<end){if("true".equals(evaluate(scenario,script)))return;Thread.sleep(250);}
        fail("Condition not reached: "+script);
    }
    @Test public void offlineLoginRotationAndHardwareBack() throws Exception {
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
            until(scenario,"document.querySelector('.baseline-login') !== null");
            assertEquals("\"https://localhost/\"",evaluate(scenario,"location.href"));
            assertEquals("true",evaluate(scenario,"document.body.innerText.includes('DATA ANDA AMAN')"));
            assertEquals("true",evaluate(scenario,"document.body.innerText.includes('A-Zuha Finance')"));
            assertEquals("true",evaluate(scenario,"(()=>{const field=document.querySelector('[name=password]');field.focus();const wrapper=getComputedStyle(field.parentElement);const ok=getComputedStyle(field).outlineStyle==='none'&&wrapper.boxShadow!=='none';field.blur();return ok})()"));
            evaluate(scenario,"document.querySelector('[name=username]').value='native-test'; document.querySelector('[name=password]').value='1'; document.querySelector('[name=confirmPassword]').value='1'; document.querySelector('[name=pin]').value='123456'; document.querySelector('[name=confirmPin]').value='123456'; document.querySelector('.login-card').requestSubmit(); true");
            until(scenario,"document.querySelector('[data-testid=balance]') !== null");
            evaluate(scenario,"[...document.querySelectorAll('.bottom-nav button,.sidebar nav button')].find(b=>b.textContent.trim()==='Transaksi').click();true");
            until(scenario,"document.querySelector('.page-title h1').textContent === 'Transaksi'");
            evaluate(scenario,"document.querySelector('[aria-label=\"Tambah transaksi\"]').click();true");
            until(scenario,"document.querySelector('dialog[open]') !== null");
            evaluate(scenario,"document.querySelector('[name=title]').value='Draft orientasi';true");
            scenario.onActivity(a -> a.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE));
            until(scenario,"innerWidth>innerHeight");
            assertEquals("\"Draft orientasi\"",evaluate(scenario,"document.querySelector('[name=title]').value"));
            Espresso.pressBack();
            until(scenario,"document.querySelector('dialog[open]') === null");
            assertEquals("true",evaluate(scenario,"document.querySelector('.page-title h1').textContent === 'Transaksi'"));
            Espresso.pressBack();
            until(scenario,"document.querySelector('[data-testid=balance]') !== null");
            scenario.onActivity(a -> a.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT));
            until(scenario,"innerHeight>innerWidth");
            assertEquals("true",evaluate(scenario,"document.documentElement.scrollWidth <= innerWidth"));
            evaluate(scenario,"document.querySelector('[aria-label=\"Tambah transaksi\"]').click();true");
            until(scenario,"document.querySelector('dialog[open]') !== null");
            evaluate(scenario,"document.querySelector('[name=title]').value='Transaksi offline tersimpan'; document.querySelector('[name=amount]').value='100000'; document.querySelector('dialog form').requestSubmit();true");
            until(scenario,"document.querySelector('dialog[open]') === null && document.querySelector('[data-testid=balance]').textContent.includes('100.000')");
            // Recreate the native Activity/WebView and unlock the persistent local vault.
            scenario.recreate();
            until(scenario,"document.querySelector('.baseline-login') !== null");
            evaluate(scenario,"document.querySelector('[name=username]').value='native-test'; document.querySelector('[name=password]').value='1'; document.querySelector('.login-card').requestSubmit();true");
            until(scenario,"document.querySelector('[data-testid=balance]')?.textContent.includes('100.000') === true");
            evaluate(scenario,"[...document.querySelectorAll('.app-shortcuts button')].find(b=>b.textContent.trim()==='Tabungan').click();true");
            until(scenario,"document.querySelector('.page-title h1')?.textContent === 'Tabungan'");
            assertEquals("true",evaluate(scenario,"document.body.innerText.includes('Tabungan Umum')"));
            evaluate(scenario,"[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='TAMBAH SETORAN').click();true");
            until(scenario,"document.querySelector('dialog[open]')?.textContent.includes('TAMBAH SETORAN TABUNGAN') === true");
            evaluate(scenario,"document.querySelector('dialog [name=amount]').value='25000'; document.querySelector('dialog form').requestSubmit();true");
            until(scenario,"document.querySelector('dialog[open]') === null && document.querySelector('.asset-hero')?.textContent.includes('25.000') === true");
            scenario.recreate();
            until(scenario,"document.querySelector('.baseline-login') !== null");
            evaluate(scenario,"document.querySelector('[name=username]').value='native-test'; document.querySelector('[name=password]').value='1'; document.querySelector('.login-card').requestSubmit();true");
            until(scenario,"document.querySelector('[data-testid=balance]')?.textContent.includes('125.000') === true");
            evaluate(scenario,"[...document.querySelectorAll('.app-shortcuts button')].find(b=>b.textContent.trim()==='Tabungan').click();true");
            until(scenario,"document.querySelector('.asset-hero')?.textContent.includes('25.000') === true");
            AtomicReference<File> cacheExportDir = new AtomicReference<>();
            scenario.onActivity(a -> cacheExportDir.set(new File(a.getCacheDir(), "exports")));
            File documentsExportDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS), "exports");
            evaluate(scenario,"[...document.querySelectorAll('.bottom-nav button')].find(b=>b.textContent.trim()==='Laporan').click();true");
            until(scenario,"document.querySelector('.report-banner .primary')?.textContent.includes('PDF laporan') === true");
            evaluate(scenario,"document.querySelector('.report-banner .primary').click();true");
            File pdf = null;
            long deadline = System.currentTimeMillis() + 30000;
            while (System.currentTimeMillis() < deadline) {
                File[] files = documentsExportDir.listFiles((dir, name) -> name.endsWith(".pdf"));
                if (files == null || files.length == 0) files = cacheExportDir.get().listFiles((dir, name) -> name.endsWith(".pdf"));
                if (files != null && files.length > 0 && files[0].length() > 100) { pdf = files[0]; break; }
                Thread.sleep(250);
            }
            assertNotNull("PDF written by the installed offline Android app", pdf);
            byte[] header = new byte[5];
            try (FileInputStream stream = new FileInputStream(pdf)) {
                assertEquals(5, stream.read(header));
            }
            assertEquals("%PDF-", new String(header, StandardCharsets.US_ASCII));
        }
    }
}
