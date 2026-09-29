package com.jia.games.data

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import java.util.Base64

/**
 * Saves things the kid made to the phone: drawings into Pictures/JiaGames and the Markdown
 * progress report into Download/JiaGames. The UI layer only talks to this repository.
 */
class DeviceFilesRepository(
    private val storage: SharedStorageDataSource,
    private val ioDispatcher: CoroutineDispatcher,
) {
    /** [dataUrl] is a `data:image/png;base64,...` URL from the drawing canvas. */
    suspend fun saveDrawing(dataUrl: String, name: String): Boolean = withContext(ioDispatcher) {
        val bytes = decodeDataUrl(dataUrl) ?: return@withContext false
        val fileName = FileNames.withExtension(FileNames.safe(name, "drawing"), "png")
        runCatching { storage.write(SharedFolder.PICTURES, fileName, "image/png", bytes) }.getOrDefault(false)
    }

    suspend fun saveTextFile(name: String, text: String, mimeType: String): Boolean = withContext(ioDispatcher) {
        val fileName = FileNames.safe(name, "report.md")
        val bytes = text.toByteArray(Charsets.UTF_8)
        runCatching { storage.write(SharedFolder.DOWNLOADS, fileName, mimeType, bytes) }.getOrDefault(false)
    }

    private fun decodeDataUrl(dataUrl: String): ByteArray? =
        runCatching { Base64.getDecoder().decode(dataUrl.substringAfter(",")) }.getOrNull()
}
