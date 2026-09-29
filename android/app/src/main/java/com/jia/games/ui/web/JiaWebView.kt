package com.jia.games.ui.web

import android.annotation.SuppressLint
import android.content.Context
import android.net.Uri
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature

/**
 * Creates the WebView that shows the web app (the /web folder packaged as APK assets), served from
 * https://appassets.androidplatform.net/assets/ so it runs in a secure context.
 */
object JiaWebView {
    const val APP_HOST = "appassets.androidplatform.net"
    val START_URL: String = Uri.Builder()
        .scheme("https").authority(APP_HOST).path("/assets/index.html").build().toString()

    @SuppressLint("SetJavaScriptEnabled") // the app is JavaScript; only our own assets are loaded
    fun create(context: Context, bridge: WebAppBridge, chromeClient: WebChromeClient): WebView {
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
            .build()

        return WebView(context).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.allowFileAccess = false
            settings.allowContentAccess = false
            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView,
                    request: WebResourceRequest,
                ): WebResourceResponse? = assetLoader.shouldInterceptRequest(request.url)

                // Keep kids inside the app: only our own pages load in the WebView.
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
                    request.url.host != APP_HOST
            }
            webChromeClient = chromeClient
            if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
                WebViewCompat.addWebMessageListener(
                    this,
                    WebAppBridge.JS_OBJECT_NAME,
                    setOf("https://$APP_HOST"),
                    bridge,
                )
            }
            loadUrl(START_URL)
        }
    }
}
