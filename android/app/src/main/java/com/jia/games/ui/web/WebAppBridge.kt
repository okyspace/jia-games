package com.jia.games.ui.web

import android.net.Uri
import android.webkit.WebView
import androidx.webkit.JavaScriptReplyProxy
import androidx.webkit.WebMessageCompat
import androidx.webkit.WebViewCompat
import com.jia.games.data.DeviceFilesRepository
import com.jia.games.ui.MainViewModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

/**
 * Receives requests from the web app (web/js/native.js) and answers them.
 *
 * Uses `addWebMessageListener` (only our own origin can talk to it) instead of
 * `addJavascriptInterface`. Messages are JSON: `{id, method, args}` → `{id, ok, result|error}`.
 * Work is done through the ViewModel and repositories, never here.
 */
class WebAppBridge(
    private val scope: CoroutineScope,
    private val files: DeviceFilesRepository,
    private val viewModel: MainViewModel,
) : WebViewCompat.WebMessageListener {

    override fun onPostMessage(
        view: WebView,
        message: WebMessageCompat,
        sourceOrigin: Uri,
        isMainFrame: Boolean,
        replyProxy: JavaScriptReplyProxy,
    ) {
        if (sourceOrigin.host != JiaWebView.APP_HOST) return
        val request = message.data?.let { runCatching { JSONObject(it) }.getOrNull() } ?: return
        val id = request.optString("id")
        val method = request.optString("method")
        val args = request.optJSONObject("args") ?: JSONObject()
        scope.launch {
            val reply = JSONObject().put("id", id)
            runCatching { handle(method, args) }
                .onSuccess { reply.put("ok", true).put("result", it) }
                .onFailure { reply.put("ok", false).put("error", it.message ?: "error") }
            replyProxy.postMessage(reply.toString())
        }
    }

    private suspend fun handle(method: String, args: JSONObject): Any = when (method) {
        "platform" -> "android"
        "nativeGames" -> JSONArray(viewModel.availableNativeGames())
        "launchNativeGame" -> viewModel.openNativeGame(args.getString("id"))
        "saveImage" -> files.saveDrawing(args.getString("dataUrl"), args.getString("name"))
        "saveText" -> files.saveTextFile(
            args.getString("name"),
            args.getString("text"),
            args.optString("mimeType", "text/markdown"),
        )
        else -> throw IllegalArgumentException("Unknown method: $method")
    }

    companion object {
        /** Name of the object the web app sees: `window.JiaNative`. */
        const val JS_OBJECT_NAME = "JiaNative"
    }
}
