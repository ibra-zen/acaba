package com.dh3games.acabasalakmiyim;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (this.getBridge() != null && this.getBridge().getWebView() != null) {
            this.getBridge().getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void exitApp() {
                    runOnUiThread(() -> finishAffinity());
                }
            }, "AndroidNative");
        }
    }

    @Override
    public void onBackPressed() {
        if (this.getBridge() != null && this.getBridge().getWebView() != null) {
            this.getBridge().getWebView().post(() -> {
                this.getBridge().getWebView().evaluateJavascript(
                    "if (typeof handleAndroidBack === 'function') { handleAndroidBack(); }", 
                    null
                );
            });
        } else {
            super.onBackPressed();
        }
    }
}



