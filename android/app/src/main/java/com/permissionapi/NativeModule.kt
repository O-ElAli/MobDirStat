package com.permissionapi

import android.content.Intent
import android.util.Log
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import android.Manifest
import com.facebook.react.bridge.*
import com.permissionapi.helpers.AppsAnalysisHelper
import com.permissionapi.helpers.MediaAnalysisHelper
import android.provider.MediaStore
import android.net.Uri
import android.os.Environment
import android.provider.Settings


class NativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NativeModule"
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
    fun checkAndRequestPermissions(promise: Promise) {
        val appsHelper = AppsAnalysisHelper(reactApplicationContext)

        if (appsHelper.hasUsageStatsPermission()) {
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

    @ReactMethod
    fun getDetailedMediaAnalysis(promise: Promise) {
        Log.d("NativeModule", "getDetailedMediaAnalysis called") // Log method call
        try {
            // Permissions check (ensure they are granted)
            if (ContextCompat.checkSelfPermission(
                    reactApplicationContext,
                    android.Manifest.permission.READ_MEDIA_IMAGES
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                Log.e("NativeModule", "READ_MEDIA_IMAGES permission not granted")
                promise.reject("PERMISSION_ERROR", "Permissions not granted for media analysis")
                return
            }

            val mediaHelper = MediaAnalysisHelper(reactApplicationContext)

            // Fetch media sizes
            val imagesSize = mediaHelper.getTotalSize(MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            val videosSize = mediaHelper.getTotalSize(MediaStore.Video.Media.EXTERNAL_CONTENT_URI)

            // Prepare result map
            val result = Arguments.createMap()
            result.putDouble("imagesSize", imagesSize / (1024.0 * 1024.0)) // Convert to MB
            result.putDouble("videosSize", videosSize / (1024.0 * 1024.0)) // Convert to MB
            result.putString("message", "Analysis complete")

            Log.d("NativeModule", "Returning result: $result")
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e("NativeModule", "Error in getDetailedMediaAnalysis", e)
            promise.reject("MEDIA_ANALYSIS_ERROR", "Failed in getDetailedMediaAnalysis", e)
        }
    }
    @ReactMethod
    fun getFilesystemStorage(promise: Promise) {
        try {
            val storageSize = AppsAnalysisHelper(reactApplicationContext).getFilesystemStorage()
            promise.resolve(storageSize / (1024.0 * 1024.0)) // Convert to MB
        } catch (e: Exception) {
            promise.reject("FILESYSTEM_ERROR", "Failed to fetch filesystem storage", e)
        }
    }

    @ReactMethod
    fun getSystemStorageUsage(promise: Promise) {
        try {
            val systemSize = AppsAnalysisHelper(reactApplicationContext).getSystemStorageUsage()
            promise.resolve(systemSize / (1024.0 * 1024.0)) // Convert to MB
        } catch (e: Exception) {
            promise.reject("SYSTEM_ERROR", "Failed to fetch system storage", e)
        }
    }

}
