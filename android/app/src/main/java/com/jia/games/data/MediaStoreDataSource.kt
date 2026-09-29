package com.jia.games.data

import android.content.ContentResolver
import android.content.ContentUris
import android.content.ContentValues
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore

/** MediaStore implementation (Android 10+; older versions report "not supported"). */
class MediaStoreDataSource(private val resolver: ContentResolver) : SharedStorageDataSource {

    override fun write(folder: SharedFolder, fileName: String, mimeType: String, bytes: ByteArray): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return false
        val (collection, relativePath) = when (folder) {
            SharedFolder.PICTURES -> MediaStore.Images.Media.EXTERNAL_CONTENT_URI to
                Environment.DIRECTORY_PICTURES + "/JiaGames/"
            SharedFolder.DOWNLOADS -> MediaStore.Downloads.EXTERNAL_CONTENT_URI to
                Environment.DIRECTORY_DOWNLOADS + "/JiaGames/"
        }
        val uri = findExisting(collection, fileName, relativePath)
            ?: resolver.insert(
                collection,
                ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                    put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                    put(MediaStore.MediaColumns.RELATIVE_PATH, relativePath)
                },
            )
        return uri != null && resolver.openOutputStream(uri, "wt")?.use { it.write(bytes) } != null
    }

    /** Files this app wrote before are updated in place instead of duplicated. */
    private fun findExisting(collection: Uri, fileName: String, relativePath: String): Uri? =
        resolver.query(
            collection,
            arrayOf(MediaStore.MediaColumns._ID),
            "${MediaStore.MediaColumns.DISPLAY_NAME} = ? AND ${MediaStore.MediaColumns.RELATIVE_PATH} = ?",
            arrayOf(fileName, relativePath),
            null,
        )?.use { cursor ->
            if (cursor.moveToFirst()) ContentUris.withAppendedId(collection, cursor.getLong(0)) else null
        }
}
