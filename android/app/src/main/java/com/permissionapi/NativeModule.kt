package com.permissionapi

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.permissionapi.helpers.AppsAnalysisHelper
import com.permissionapi.helpers.MediaAnalysisHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import android.provider.Settings
import android.net.Uri
import java.io.File
import androidx.core.content.FileProvider




class NativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NativeModule"
    }

    // ✅ Function to check and request media permissions
    private fun hasMediaPermissions(): Boolean {
        val permissions = arrayOf(
            Manifest.permission.READ_MEDIA_IMAGES,
            Manifest.permission.READ_MEDIA_VIDEO,
            Manifest.permission.READ_MEDIA_AUDIO
        )

        return permissions.all {
            ContextCompat.checkSelfPermission(reactApplicationContext, it) == PackageManager.PERMISSION_GRANTED
        }
    }

    @ReactMethod
    fun requestUsageStatsPermission(promise: Promise) {
        val context = reactApplicationContext
        val appsHelper = AppsAnalysisHelper(context)

        if (!appsHelper.hasUsageStatsPermission()) {
            val intent = Intent(android.provider.Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
            promise.resolve(false)
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun getStorageHierarchy(promise: Promise) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val mediaHelper = MediaAnalysisHelper(reactApplicationContext)
                val result = mediaHelper.getStorageHierarchy()
                
                withContext(Dispatchers.Main) {
                    promise.resolve(result) // Ensure result is sent back on main thread
                }
            } catch (e: Exception) {
                Log.e("NativeModule", "❌ Error in getStorageHierarchy", e)
                withContext(Dispatchers.Main) {
                    promise.reject("MEDIA_HIERARCHY_ERROR", "Failed to fetch full storage hierarchy", e)
                }
            }
        }
    }

    

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val appsHelper = AppsAnalysisHelper(reactApplicationContext)
                val appsList = withContext(Dispatchers.IO) { appsHelper.getInstalledAppsWithSizes() } // Ensure suspend function is called correctly
    
                withContext(Dispatchers.Main) {
                    promise.resolve(appsList)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    promise.reject("APP_ERROR", "Failed to fetch installed apps", e)
                }
            }
        }
    }
    
    
    @ReactMethod
    fun getFilesystemStorage(promise: Promise) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val storageSize = withContext(Dispatchers.IO) { AppsAnalysisHelper(reactApplicationContext).getFilesystemStorage() }
    
                withContext(Dispatchers.Main) {
                    promise.resolve(storageSize / (1024.0 * 1024.0)) // Convert bytes to MB
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    promise.reject("FILESYSTEM_ERROR", "Failed to fetch filesystem storage", e)
                }
            }
        }
    }
    
    @ReactMethod
    fun getSystemStorageUsage(promise: Promise) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val systemSize = withContext(Dispatchers.IO) { AppsAnalysisHelper(reactApplicationContext).getSystemStorageUsage() }
    
                withContext(Dispatchers.Main) {
                    promise.resolve(systemSize / (1024.0 * 1024.0)) // Convert bytes to MB
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    promise.reject("SYSTEM_ERROR", "Failed to fetch system storage", e)
                }
            }
        }
    }
    
    @ReactMethod
    fun openAppSettings(packageName: String) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
            intent.data = Uri.parse("package:$packageName")
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            currentActivity?.startActivity(intent) // Make sure to use currentActivity
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // ✅ Check if media permissions are granted
    @ReactMethod
    fun checkMediaPermissions(promise: Promise) {
        if (hasMediaPermissions()) {
            promise.resolve(true)
        } else {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openFileLocation(filePath: String) {
        try {
            val file = File(filePath)
            if (!file.exists()) {
                Log.e("NativeModule", "File not found: $filePath")
                return
            }

            val uri: Uri = FileProvider.getUriForFile(
                reactApplicationContext,
                "${reactApplicationContext.packageName}.fileprovider",
                file
            )

            val mimeType = when {
                filePath.endsWith(".jpg", true) || filePath.endsWith(".jpeg", true) || filePath.endsWith(".png", true) -> "image/*"
                filePath.endsWith(".mp4", true) || filePath.endsWith(".mkv", true) || filePath.endsWith(".avi", true) -> "video/*"
                filePath.endsWith(".mp3", true) || filePath.endsWith(".wav", true) -> "audio/*"
                else -> "*/*"
            }

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, mimeType)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            reactApplicationContext.startActivity(intent)
        } catch (e: Exception) {
            Log.e("NativeModule", "Error opening file: $filePath", e)
        }
    }


}