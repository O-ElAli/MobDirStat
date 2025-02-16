package com.permissionapi.helpers

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import java.io.File

class MediaAnalysisHelper(private val context: Context) {

    // ✅ Scans the entire filesystem recursively (like DiskUsage)
    fun getStorageHierarchy(): WritableMap {
        Log.d("MediaAnalysisHelper", "📢 Scanning full storage structure")

        val rootDirectory = File("/storage/emulated/0") // Internal storage
        val rootMap = Arguments.createMap()
        rootMap.putString("name", "Internal Storage")

        scanDirectory(rootDirectory, rootMap)

        Log.d("MediaAnalysisHelper", "✅ Returning full storage hierarchy")
        return rootMap
    }

    // ✅ Recursively scan directories and add them to the hierarchy
    private fun scanDirectory(directory: File, parent: WritableMap) {
        val files = directory.listFiles() ?: return
        val children = Arguments.createArray()

        for (file in files) {
            val fileData = Arguments.createMap()
            fileData.putString("name", file.name)
            fileData.putDouble("size", file.length().toDouble()) // Size in bytes
            fileData.putString("path", file.absolutePath)

            if (file.isDirectory) {
                scanDirectory(file, fileData) // Recursively scan subfolders
            }

            children.pushMap(fileData)
        }

        parent.putArray("children", children)
    }
}
