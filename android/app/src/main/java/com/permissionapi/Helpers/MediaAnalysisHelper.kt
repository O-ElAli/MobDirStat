package com.permissionapi.helpers

import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.provider.MediaStore
import android.util.Log

class MediaAnalysisHelper(private val context: Context) {

    fun getTotalSize(uri: Uri): Long {
        Log.d("MediaAnalysisHelper", "Starting getTotalSize for URI: $uri")
        var totalSize: Long = 0
        val projection = arrayOf(MediaStore.MediaColumns.SIZE, MediaStore.MediaColumns.DISPLAY_NAME)

        try {
            val cursor: Cursor? = context.contentResolver.query(uri, projection, null, null, null)
            cursor?.use {
                val sizeIndex = it.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE)
                while (it.moveToNext()) {
                    val fileSize = it.getLong(sizeIndex)
                    if (fileSize > 0) {
                        totalSize += fileSize
                    } else {
                        Log.w("MediaAnalysisHelper", "Skipping file with invalid size: $fileSize")
                    }
                }
            } ?: Log.e("MediaAnalysisHelper", "Cursor is null for URI: $uri")
        } catch (e: Exception) {
            Log.e("MediaAnalysisHelper", "Error in getTotalSize for URI: $uri", e)
        }

        Log.d("MediaAnalysisHelper", "Total size for URI $uri: $totalSize")
        return totalSize
    }
    
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
            "text/plain" // Added MIME type for testing
        )
    
        try {
            Log.d("MediaAnalysisHelper", "Querying documents with selection: $selection and args: ${selectionArgs.joinToString()}")
            val cursor: Cursor? = context.contentResolver.query(
                MediaStore.Files.getContentUri("external"),
                projection,
                selection,
                selectionArgs,
                null
            )
    
            Log.d("MediaAnalysisHelper", "Cursor count: ${cursor?.count ?: 0}")
    
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
            } ?: Log.e("MediaAnalysisHelper", "Cursor is null for documents query")
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
