package com.jia.games

import android.content.ContentUris
import android.content.ContentValues
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import org.json.JSONArray

/**
 * Native functions the web app can call as `window.JiaNative.<name>(...)`.
 * See web/js/native.js for the JavaScript side (with browser fallbacks).
 */
class JiaBridge(private val activity: MainActivity) {

    @JavascriptInterface
    fun platform(): String = "android"

    /** JSON array of native game ids that this build can launch. */
    @JavascriptInterface
    fun nativeGames(): String = JSONArray(NativeGames.registry.keys.toList()).toString()

    @JavascriptInterface
    fun launchNativeGame(id: String): Boolean {
        val cls = NativeGames.registry[id] ?: return false
        activity.runOnUiThread { activity.launchNative(cls) }
        return true
    }

    /**
     * Saves (overwrites) a text file in the phone's Download/JiaGames folder, e.g. the
     * Markdown progress report written by web/js/report.js.
     */
    @JavascriptInterface
    fun saveTextFile(fileName: String, text: String, mimeType: String): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return false
        return try {
            val safeName = fileName.replace(Regex("[^A-Za-z0-9._-]"), "_")
            val folder = Environment.DIRECTORY_DOWNLOADS + "/JiaGames/"
            val resolver = activity.contentResolver
            val collection = MediaStore.Downloads.EXTERNAL_CONTENT_URI
            // Reuse the file we wrote before so the report is updated in place.
            val existing = resolver.query(
                collection,
                arrayOf(MediaStore.Downloads._ID),
                "${MediaStore.Downloads.DISPLAY_NAME} = ? AND ${MediaStore.Downloads.RELATIVE_PATH} = ?",
                arrayOf(safeName, folder),
                null,
            )?.use { cursor ->
                if (cursor.moveToFirst()) ContentUris.withAppendedId(collection, cursor.getLong(0)) else null
            }
            val uri = existing ?: resolver.insert(collection, ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, safeName)
                put(MediaStore.Downloads.MIME_TYPE, mimeType)
                put(MediaStore.Downloads.RELATIVE_PATH, folder)
            }) ?: return false
            resolver.openOutputStream(uri, "wt")?.use { it.write(text.toByteArray(Charsets.UTF_8)) } ?: return false
            true
        } catch (e: Exception) {
            false
        }
    }

    /** Saves a PNG data URL into the phone's Pictures/JiaGames folder. */
    @JavascriptInterface
    fun saveImageToGallery(dataUrl: String, fileName: String): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return false
        return try {
            val bytes = Base64.decode(dataUrl.substringAfter(","), Base64.DEFAULT)
            val safeName = fileName.replace(Regex("[^A-Za-z0-9_-]"), "_").ifBlank { "drawing" }
            val values = ContentValues().apply {
                put(MediaStore.Images.Media.DISPLAY_NAME, "$safeName.png")
                put(MediaStore.Images.Media.MIME_TYPE, "image/png")
                put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/JiaGames")
            }
            val resolver = activity.contentResolver
            val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values) ?: return false
            resolver.openOutputStream(uri)?.use { it.write(bytes) } ?: return false
            true
        } catch (e: Exception) {
            false
        }
    }
}
