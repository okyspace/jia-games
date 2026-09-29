package com.jia.games.data

/** Low-level access to the phone's shared folders (Pictures, Download). */
interface SharedStorageDataSource {
    /** Writes (or overwrites) a file. Returns false if the platform can't do it. */
    fun write(folder: SharedFolder, fileName: String, mimeType: String, bytes: ByteArray): Boolean
}

enum class SharedFolder { PICTURES, DOWNLOADS }
