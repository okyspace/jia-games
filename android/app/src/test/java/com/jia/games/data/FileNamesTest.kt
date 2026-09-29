package com.jia.games.data

import org.junit.Assert.assertEquals
import org.junit.Test

class FileNamesTest {
    @Test
    fun `unsafe characters become underscores`() {
        assertEquals("my_drawing__1_.png", FileNames.safe("my drawing (1).png"))
    }

    @Test
    fun `path tricks are removed`() {
        assertEquals("_etc_passwd", FileNames.safe("../etc/passwd").trimStart('.'))
        assertEquals("file", FileNames.safe("..."))
    }

    @Test
    fun `blank names use the fallback`() {
        assertEquals("drawing", FileNames.safe("", "drawing"))
    }

    @Test
    fun `extension is added once`() {
        assertEquals("cat.png", FileNames.withExtension("cat", "png"))
        assertEquals("cat.PNG", FileNames.withExtension("cat.PNG", "png"))
    }
}
