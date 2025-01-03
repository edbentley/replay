package com.replay.android

import android.app.AlertDialog
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader

open class ReplayActivity : AppCompatActivity() {
    lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        this.supportActionBar?.hide()

        // Extend into notch area
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .addPathHandler("/res/", WebViewAssetLoader.ResourcesPathHandler(this))
            .build()

        webView = WebView(this)
        webView.settings.allowFileAccess = true
        webView.settings.allowContentAccess = true
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.useWideViewPort = true
        webView.isHapticFeedbackEnabled = false

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: android.webkit.WebResourceRequest?
            ): android.webkit.WebResourceResponse? {
                return request?.url?.let { assetLoader.shouldInterceptRequest(it) }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {

            override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                if (message.messageLevel() === ConsoleMessage.MessageLevel.ERROR) {
                    Log.e(
                        "Replay",
                        "Error on line ${message.lineNumber()} of ${message.sourceId()}: ${message.message()}"
                    )
                    return true
                }
                Log.d("Replay", message.message())
                return true
            }
        }

        webView.addJavascriptInterface(WebAppInterface(this), "Android")

        setContentView(webView)

        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    open fun onJsCallback(
        id: String,
        message: String,
        message2: String,
        message3: String,
        message4: String,
        message5: String
    ) {
        // For overriding
    }

    fun jsBridge(messageId: String, jsArg: String) {
        runOnUiThread {
            webView.evaluateJavascript(
                "window.__replayGlobalCallbacks__[`${messageId}`] && window.__replayGlobalCallbacks__[`${messageId}`](${jsArg});",
                null
            )
        }
    }

    fun showOkDialog(message: String, callback: () -> Unit) {
        val builder = AlertDialog.Builder(this)
        builder.setMessage(message)

        builder.setPositiveButton("OK") { _, _ ->
            callback()
        }

        val dialog: AlertDialog = builder.create()
        dialog.show()
    }

    fun showOkCancelDialog(message: String, callback: (wasOk: Boolean) -> Unit) {
        val builder = AlertDialog.Builder(this)
        builder.setMessage(message)

        builder.setPositiveButton("OK") { _, _ ->
            callback(true)
        }

        builder.setNegativeButton("Cancel") { _, _ ->
            callback(false)
        }

        val dialog: AlertDialog = builder.create()
        dialog.show()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideSystemUI()
    }

    private fun hideSystemUI() {
        // Enables sticky immersive mode.
        window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                // Set the content to appear under the system bars so that the
                // content doesn't resize when the system bars hide and show.
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                // Hide the nav bar and status bar
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN)
    }

}