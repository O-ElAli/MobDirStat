package com.permissionapi.helpers

import android.content.Context
import android.database.Cursor
import android.provider.MediaStore
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject

class MediaAnalysisHelper(private val context: Context) {

    // ✅ Fetch all media files (Images, Videos, etc.)
    fun getMediaFiles(): String {
        Log.d("MediaAnalysisHelper", "Fetching media files with detailed info")

        val mediaList = JSONArray()
        val projection = arrayOf(
            MediaStore.MediaColumns.DISPLAY_NAME,
            MediaStore.MediaColumns.SIZE,
            MediaStore.MediaColumns.MIME_TYPE
        )

        val selection = "${MediaStore.MediaColumns.SIZE} > ?"
        val selectionArgs = arrayOf("0")  // Ignore zero-size files

        val cursor: Cursor? = context.contentResolver.query(
            MediaStore.Files.getContentUri("external"),
            projection,
            selection,
            selectionArgs,
            null
        )

        cursor?.use {
            val nameIndex = it.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME)
            val sizeIndex = it.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE)
            val typeIndex = it.getColumnIndexOrThrow(MediaStore.MediaColumns.MIME_TYPE)

            while (it.moveToNext()) {
                val fileName = it.getString(nameIndex)
                val fileSize = it.getLong(sizeIndex)
                val fileType = it.getString(typeIndex)

                if (fileSize > 0) {
                    val mediaObject = JSONObject()
                    mediaObject.put("name", fileName)
                    mediaObject.put("size", fileSize)  // Size in bytes
                    mediaObject.put("type", fileType)

                    mediaList.put(mediaObject)
                }
            }
        } ?: Log.e("MediaAnalysisHelper", "Cursor is null for media query")

        Log.d("MediaAnalysisHelper", "Media files fetched successfully")
        return mediaList.toString()
    }

    // ✅ Keep this function to also analyze documents (PDF, Word, etc.)
    fun getDocumentsWithDetails(): String {
        Log.d("MediaAnalysisHelper", "Starting getDocumentsWithDetails")
        val documentDetailsList = mutableListOf<Triple<String, Long, String>>() // (Name, Size, MIME Type)
        val projection = arrayOf(
            MediaStore.Files.FileColumns.DISPLAY_NAME,
            MediaStore.Files.FileColumns.SIZE,
            MediaStore.Files.FileColumns.MIME_TYPE
        )
        val selection = "${MediaStore.Files.FileColumns.MIME_TYPE} LIKE ? OR " +
                        "${MediaStore.Files.FileColumns.MIME_TYPE} LIKE ? OR " +
                        "${MediaStore.Files.FileColumns.MIME_TYPE} LIKE ? OR " +
                        "${MediaStore.Files.FileColumns.MIME_TYPE} LIKE ?"
        val selectionArgs = arrayOf(
            "application/pdf",
            "application/msword",
            "application/vnd.ms-excel",
            "text/plain"
        )

        try {
            Log.d("MediaAnalysisHelper", "Querying documents with selection: $selection")
            val cursor: Cursor? = context.contentResolver.query(
                MediaStore.Files.getContentUri("external"),
                projection,
                selection,
                selectionArgs,
                null
            )

            cursor?.use {
                val nameIndex = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DISPLAY_NAME)
                val sizeIndex = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.SIZE)
                val typeIndex = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.MIME_TYPE)

                while (it.moveToNext()) {
                    val name = it.getString(nameIndex)
                    val size = it.getLong(sizeIndex)
                    val type = it.getString(typeIndex)

                    if (size > 0) {
                        documentDetailsList.add(Triple(name, size, type))
                        Log.d("MediaAnalysisHelper", "Document: $name, Size: $size, Type: $type")
                    } else {
                        Log.w("MediaAnalysisHelper", "Document $name has size $size, skipping")
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("MediaAnalysisHelper", "Error in getDocumentsWithDetails", e)
        }

        documentDetailsList.sortByDescending { it.second } // Sort by size (descending)

        val documentDetails = StringBuilder()
        documentDetails.append("Documents Total Size: ${documentDetailsList.sumOf { it.second } / (1024 * 1024)} MB\n\n")

        for ((name, size, type) in documentDetailsList) {
            documentDetails.append("Name: $name\nSize: ${size / (1024 * 1024)} MB\nType: $type\n\n")
        }

        if (documentDetailsList.isEmpty()) {
            Log.w("MediaAnalysisHelper", "No documents found.")
            return "No documents found."
        }

        Log.d("MediaAnalysisHelper", "Documents fetched successfully")
        return documentDetails.toString()
    }
}
