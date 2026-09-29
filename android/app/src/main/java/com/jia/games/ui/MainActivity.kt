package com.jia.games.ui

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.jia.games.BuildConfig
import com.jia.games.JiaGamesApp
import com.jia.games.ui.web.JiaWebChromeClient
import com.jia.games.ui.web.JiaWebView
import com.jia.games.ui.web.WebAppBridge

/**
 * The app's single activity. It wires the WebView (web app) and native Compose games together,
 * and handles Android-only things: runtime permissions, the file picker and the back button.
 */
class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels { MainViewModel.Factory }
    private lateinit var webView: WebView
    private var pendingMicRequest: PermissionRequest? = null
    private var pendingFileCallback: ValueCallback<Array<Uri>>? = null

    private val micPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            val request = pendingMicRequest ?: return@registerForActivityResult
            pendingMicRequest = null
            if (granted) request.grant(arrayOf(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) else request.deny()
        }

    // Photo / logo uploads (<input type="file">) open the system picker.
    private val filePicker =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val callback = pendingFileCallback ?: return@registerForActivityResult
            pendingFileCallback = null
            callback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data))
        }

    private val notificationPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
        val container = (application as JiaGamesApp).container

        webView = JiaWebView.create(
            context = this,
            bridge = WebAppBridge(lifecycleScope, container.deviceFilesRepository, viewModel),
            chromeClient = JiaWebChromeClient(::onMicrophoneRequest, ::onFileChooser),
        )
        onBackPressedDispatcher.addCallback(this, webBackCallback)
        setContent { JiaApp(viewModel, webView, container.nativeGames) }

        container.bedtimeScheduler.scheduleNext()
        askForNotificationPermission()
    }

    // Let the web app close dialogs / games first; exit only when it says so.
    // (A native game on screen registers its own BackHandler, which runs before this.)
    private val webBackCallback = object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
            webView.evaluateJavascript("window.jia ? window.jia.handleBack() : false") { handled ->
                if (handled != "true") finish()
            }
        }
    }

    private fun onMicrophoneRequest(request: PermissionRequest) {
        val granted = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) ==
            PackageManager.PERMISSION_GRANTED
        if (granted) {
            request.grant(arrayOf(PermissionRequest.RESOURCE_AUDIO_CAPTURE))
        } else {
            pendingMicRequest?.deny()
            pendingMicRequest = request
            micPermission.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    private fun onFileChooser(
        callback: ValueCallback<Array<Uri>>,
        params: WebChromeClient.FileChooserParams,
    ): Boolean {
        pendingFileCallback?.onReceiveValue(null)
        pendingFileCallback = callback
        return try {
            filePicker.launch(params.createIntent())
            true
        } catch (e: ActivityNotFoundException) {
            Log.w(TAG, "No app can pick files", e)
            pendingFileCallback = null
            false
        }
    }

    private fun askForNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    private companion object {
        const val TAG = "JiaGames"
    }
}
