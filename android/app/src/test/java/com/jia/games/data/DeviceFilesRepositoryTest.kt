package com.jia.games.data

import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.Base64

/** A fake data source that remembers what was written (Google: prefer fakes to mocks). */
private class FakeSharedStorage(private val works: Boolean = true) : SharedStorageDataSource {
    data class Written(val folder: SharedFolder, val fileName: String, val mimeType: String, val bytes: ByteArray)

    val written = mutableListOf<Written>()

    override fun write(folder: SharedFolder, fileName: String, mimeType: String, bytes: ByteArray): Boolean {
        if (!works) return false
        written += Written(folder, fileName, mimeType, bytes)
        return true
    }
}

class DeviceFilesRepositoryTest {
    private val pngBytes = byteArrayOf(-119, 80, 78, 71)
    private val dataUrl = "data:image/png;base64," + Base64.getEncoder().encodeToString(pngBytes)

    @Test
    fun `drawing is decoded and saved to Pictures as png`() = runTest {
        val storage = FakeSharedStorage()
        val repo = DeviceFilesRepository(storage, StandardTestDispatcher(testScheduler))

        assertTrue(repo.saveDrawing(dataUrl, "jia drawing 1"))

        val file = storage.written.single()
        assertEquals(SharedFolder.PICTURES, file.folder)
        assertEquals("jia_drawing_1.png", file.fileName)
        assertEquals("image/png", file.mimeType)
        assertArrayEquals(pngBytes, file.bytes)
    }

    @Test
    fun `broken data url is refused`() = runTest {
        val storage = FakeSharedStorage()
        val repo = DeviceFilesRepository(storage, StandardTestDispatcher(testScheduler))

        assertFalse(repo.saveDrawing("data:image/png;base64,***not base64***", "x"))
        assertTrue(storage.written.isEmpty())
    }

    @Test
    fun `progress report goes to Downloads as utf8 text`() = runTest {
        val storage = FakeSharedStorage()
        val repo = DeviceFilesRepository(storage, StandardTestDispatcher(testScheduler))

        assertTrue(repo.saveTextFile("jia-games-progress.md", "# 进度 ⭐", "text/markdown"))

        val file = storage.written.single()
        assertEquals(SharedFolder.DOWNLOADS, file.folder)
        assertEquals("jia-games-progress.md", file.fileName)
        assertEquals("# 进度 ⭐", file.bytes.toString(Charsets.UTF_8))
    }

    @Test
    fun `storage failure is reported as false`() = runTest {
        val repo = DeviceFilesRepository(FakeSharedStorage(works = false), StandardTestDispatcher(testScheduler))
        assertFalse(repo.saveTextFile("a.md", "hi", "text/markdown"))
    }
}
