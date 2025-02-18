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

    

    // ✅ Fetch total storage available on the filesystem
    @ReactMethod
    fun getFilesystemStorage(promise: Promise) {
        try {
            val storageSize = AppsAnalysisHelper(reactApplicationContext).getFilesystemStorage()
            promise.resolve(storageSize / (1024.0 * 1024.0)) // Convert bytes to MB
        } catch (e: Exception) {
            Log.e("NativeModule", "❌ Error fetching filesystem storage", e)
            promise.reject("FILESYSTEM_ERROR", "Failed to fetch filesystem storage", e)
        }
    }

    // ✅ Fetch system storage usage (how much space system files take)
    @ReactMethod
    fun getSystemStorageUsage(promise: Promise) {
        try {
            val systemSize = AppsAnalysisHelper(reactApplicationContext).getSystemStorageUsage()
            promise.resolve(systemSize / (1024.0 * 1024.0)) // Convert bytes to MB
        } catch (e: Exception) {
            Log.e("NativeModule", "❌ Error fetching system storage", e)
            promise.reject("SYSTEM_ERROR", "Failed to fetch system storage", e)
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
    fun getInstalledApps(promise: Promise) {
        try {
            val appsHelper = AppsAnalysisHelper(reactApplicationContext)
            val appsList = appsHelper.getInstalledAppsWithSizes()
            promise.resolve(appsList)
        } catch (e: Exception) {
            promise.reject("APP_ERROR", "Failed to fetch installed apps", e)
        }
    }
}