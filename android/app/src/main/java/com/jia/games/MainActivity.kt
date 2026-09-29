package com.jia.games

import android.Manifest
import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader

/**
 * Hosts the Jia Games web app (the /web folder, packaged as APK assets).
 *
 * The app is served from https://appassets.androidplatform.net/assets/ so that it
 * runs in a secure context (needed for microphone recording and IndexedDB), and
 * talks to native code through [JiaBridge] (exposed to JavaScript as `JiaNative`).
 */
class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private var pendingMicRequest: PermissionRequest? = null
    private var pendingFileCallback: ValueCallback<Array<Uri>>? = null

    // Photo / logo uploads (<input type="file">) open the system picker.
    private val filePicker =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val callback = pendingFileCallback ?: return@registerForActivityResult
            pendingFileCallback = null
            callback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data))
        }

    private val micPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            val request = pendingMicRequest ?: return@registerForActivityResult
            pendingMicRequest = null
            if (granted) {
                request.grant(arrayOf(PermissionRequest.RESOURCE_AUDIO_CAPTURE))
            } else {
                request.deny()
            }
        }

    private val notificationPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.allowFileAccess = false
            settings.allowContentAccess = false
            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView,
                    request: WebResourceRequest,
                ): WebResourceResponse? = assetLoader.shouldInterceptRequest(request.url)

                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: WebResourceRequest,
                ): Boolean {
                    // Keep kids inside the app: only our own pages load in the WebView.
                    return request.url.host != APP_HOST
                }
            }
            webChromeClient = object : WebChromeClient() {
                override fun onPermissionRequest(request: PermissionRequest) {
                    runOnUiThread { handlePermissionRequest(request) }
                }

                override fun onShowFileChooser(
                    view: WebView,
                    filePathCallback: ValueCallback<Array<Uri>>,
                    fileChooserParams: FileChooserParams,
                ): Boolean {
                    pendingFileCallback?.onReceiveValue(null)
                    pendingFileCallback = filePathCallback
                    return try {
                        filePicker.launch(fileChooserParams.createIntent())
                        true
                    } catch (e: ActivityNotFoundException) {
                        pendingFileCallback = null
                        false
                    }
                }
            }
            addJavascriptInterface(JiaBridge(this@MainActivity), "JiaNative")
        }
        setContentView(webView)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // Let the web app close dialogs / games first; exit only when it says so.
                webView.evaluateJavascript("window.jia ? window.jia.handleBack() : false") { handled ->
                    if (handled != "true") finish()
                }
            }
        })

        webView.loadUrl(START_URL)

        BedtimeReminder.schedule(this)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    // Lets the web app know when it is off screen (so break timers don't count that time).
    override fun onPause() {
        webView.onPause()
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    private fun handlePermissionRequest(request: PermissionRequest) {
        val wantsMic = request.resources.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)
        val fromUs = request.origin?.host == APP_HOST
        if (!wantsMic || !fromUs) {
            request.deny()
            return
        }
        val hasMic = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) ==
            PackageManager.PERMISSION_GRANTED
        if (hasMic) {
            request.grant(arrayOf(PermissionRequest.RESOURCE_AUDIO_CAPTURE))
        } else {
            pendingMicRequest?.deny()
            pendingMicRequest = request
            micPermission.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    fun launchNative(cls: Class<*>) {
        startActivity(Intent(this, cls))
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    companion object {
        const val APP_HOST = "appassets.androidplatform.net"
        val START_URL: String = Uri.Builder()
            .scheme("https").authority(APP_HOST).path("/assets/index.html").build().toString()
    }
}
