package com.permissionapi.helpers

import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.provider.MediaStore
import android.util.Log

class MediaAnalysisHelper(private val context: Context) {

    fun getTotalSize(uri: Uri): Long {
        var totalSize: Long = 0
        val projection = arrayOf(MediaStore.MediaColumns.SIZE)

        try {
            val cursor: Cursor? = context.contentResolver.query(uri, projection, null, null, null)
            if (cursor == null) {
                Log.e("MediaAnalysisHelper", "Cursor is null for URI: $uri")
                return 0
            }

            cursor.use {
                val sizeIndex = it.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE)
                while (it.moveToNext()) {
                    val size = it.getLong(sizeIndex)
                    if (size > 0) {
                        totalSize += size
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("MediaAnalysisHelper", "Error calculating total size for URI: $uri", e)
        }

        return totalSize
    }

    fun getDocumentsWithSizes(): List<Map<String, Any>> {
        val documents = mutableListOf<Map<String, Any>>()
        val projection = arrayOf(
            MediaStore.Files.FileColumns.DISPLAY_NAME,
            MediaStore.Files.FileColumns.SIZE
        )

        try {
            val uri = MediaStore.Files.getContentUri("external")
            val cursor: Cursor? = context.contentResolver.query(uri, projection, null, null, null)

            cursor?.use {
                val nameIndex = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DISPLAY_NAME)
                val sizeIndex = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.SIZE)

                while (it.moveToNext()) {
                    val name = it.getString(nameIndex) ?: "Unknown"
                    val size = it.getLong(sizeIndex)
                    if (size > 0) {
                        documents.add(mapOf("name" to name, "size" to size))
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("MediaAnalysisHelper", "Error fetching documents", e)
        }

        return documents
    }
}
