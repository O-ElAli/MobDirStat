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
            val appsAnalysis = appsHelper.getInstalledAppsWithSizes()
            promise.resolve(appsAnalysis)
        } catch (e: Exception) {
            promise.reject("APP_ERROR", "Failed to fetch installed apps", e)
        }
    }

    @ReactMethod
    fun getDetailedMediaAnalysis(promise: Promise) {
        try {
            val permissionsGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ContextCompat.checkSelfPermission(
                    reactApplicationContext,
                    Manifest.permission.READ_MEDIA_IMAGES
                ) == PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission(
                    reactApplicationContext,
                    Manifest.permission.READ_MEDIA_VIDEO
                ) == PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission(
                    reactApplicationContext,
                    Manifest.permission.READ_MEDIA_AUDIO
                ) == PackageManager.PERMISSION_GRANTED
            } else {
                ContextCompat.checkSelfPermission(
                    reactApplicationContext,
                    Manifest.permission.READ_EXTERNAL_STORAGE
                ) == PackageManager.PERMISSION_GRANTED
            }

            if (!permissionsGranted) {
                promise.reject("PERMISSION_ERROR", "Permissions not granted for media analysis")
                return
            }

            val mediaHelper = MediaAnalysisHelper(reactApplicationContext)

            val imagesSize = mediaHelper.getTotalSize(MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            val videosSize = mediaHelper.getTotalSize(MediaStore.Video.Media.EXTERNAL_CONTENT_URI)
            val documents = mediaHelper.getDocumentsWithSizes()

            val result = mapOf(
                "imagesSize" to imagesSize / (1024 * 1024), // Convert to MB
                "videosSize" to videosSize / (1024 * 1024),
                "documents" to documents
            )
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("MEDIA_ANALYSIS_ERROR", "Failed to fetch media analysis", e)
        }
    }
}
