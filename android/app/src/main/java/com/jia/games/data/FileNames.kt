package com.jia.games.data

/** Pure helpers for file names saved to shared storage (unit tested). */
object FileNames {
    private val unsafe = Regex("[^A-Za-z0-9._-]")

    /** Keeps letters, digits, dot, dash and underscore; never returns an empty name. */
    fun safe(name: String, fallback: String = "file"): String =
        name.replace(unsafe, "_").trim('.').ifBlank { fallback }

    /** Adds [extension] unless the name already ends with it (case-insensitive). */
    fun withExtension(name: String, extension: String): String =
        if (name.lowercase().endsWith(".$extension")) name else "$name.$extension"
}
