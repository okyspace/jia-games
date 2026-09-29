package com.jia.games.ui.web

import android.net.Uri
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView

/** Forwards microphone requests and file pickers from the web app to the activity. */
class JiaWebChromeClient(
    private val onMicrophoneRequest: (PermissionRequest) -> Unit,
    private val onFileChooser: (ValueCallback<Array<Uri>>, WebChromeClient.FileChooserParams) -> Boolean,
) : WebChromeClient() {

    override fun onPermissionRequest(request: PermissionRequest) {
        val wantsMic = PermissionRequest.RESOURCE_AUDIO_CAPTURE in request.resources
        if (wantsMic && request.origin?.host == JiaWebView.APP_HOST) onMicrophoneRequest(request) else request.deny()
    }

    override fun onShowFileChooser(
        webView: WebView,
        filePathCallback: ValueCallback<Array<Uri>>,
        fileChooserParams: WebChromeClient.FileChooserParams,
    ): Boolean = onFileChooser(filePathCallback, fileChooserParams)
}
