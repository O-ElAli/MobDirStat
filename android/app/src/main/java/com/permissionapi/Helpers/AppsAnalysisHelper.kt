package com.permissionapi.helpers

import android.app.AppOpsManager
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.Build
import android.util.Base64
import android.util.Log
import android.os.Process
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import java.io.ByteArrayOutputStream
import java.io.File

class AppsAnalysisHelper(private val context: Context) {

    /**
     * Checks if the app has usage stats permission.
     */
    fun hasUsageStatsPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    /**
     * Retrieves a list of installed apps, their sizes, and icons.
     */
    fun getInstalledAppsWithSizes(): WritableArray {
        val pm: PackageManager = context.packageManager
        val apps = pm.getInstalledApplications(PackageManager.GET_META_DATA or PackageManager.MATCH_SYSTEM_ONLY)
        val appList = Arguments.createArray()

        for (app in apps) {
            try {
                // Retrieve actual app information
                val appInfo = pm.getApplicationInfo(app.packageName, PackageManager.GET_META_DATA)
                val appName = pm.getApplicationLabel(appInfo).toString()
                val packageName = appInfo.packageName
                val appSize = getAppSizeInBytes(packageName)
                val appIconBase64 = getAppIconBase64(appInfo, pm)

                // Only add apps with valid size
                if (appSize > 0) {
                    val appData = Arguments.createMap()
                    appData.putString("name", appName)
                    appData.putString("packageName", packageName)
                    appData.putDouble("size", appSize / (1024.0 * 1024.0)) // Convert bytes to MB
                    appData.putString("icon", appIconBase64)

                    appList.pushMap(appData)
                } else {
                    Log.w("AppsAnalysisHelper", "Skipped app: $packageName (size 0)")
                }
            } catch (e: Exception) {
                Log.e("AppsAnalysisHelper", "Error processing app: ${app.packageName}", e)
            }
        }

        Log.d("AppsAnalysisHelper", "Total apps analyzed: ${appList.size()}")
        return appList
    }

    /**
     * Retrieves the total size of an app in bytes.
     */
    private fun getAppSizeInBytes(packageName: String): Long {
        return try {
            var totalSize: Long = 0
    
            // ✅ Get app size using StorageStatsManager (Android 8+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                try {
                    val storageStatsManager = context.getSystemService(Context.STORAGE_STATS_SERVICE) as android.app.usage.StorageStatsManager
                    val storageManager = context.getSystemService(Context.STORAGE_SERVICE) as android.os.storage.StorageManager
                    val uuid = storageManager.getUuidForPath(context.filesDir)
                    val storageStats = storageStatsManager.queryStatsForPackage(uuid, packageName, Process.myUserHandle())
    
                    totalSize += storageStats.appBytes
                    Log.d("AppSize", "Package: $packageName, StorageStats Size: ${storageStats.appBytes} bytes (${storageStats.appBytes / (1024.0 * 1024.0)} MB)")
                } catch (e: Exception) {
                    Log.e("AppSize", "Error retrieving StorageStats for $packageName", e)
                }
            }
    
            // ✅ Fallback: Get APK file size
            try {
                val packageInfo = context.packageManager.getPackageInfo(packageName, 0)
                val sourceDir = packageInfo.applicationInfo?.sourceDir
                if (sourceDir != null) {
                    val file = File(sourceDir)
                    totalSize += file.length()
                    Log.d("AppSize", "Package: $packageName, APK File Size: ${file.length()} bytes (${file.length() / (1024.0 * 1024.0)} MB)")
                }
            } catch (e: Exception) {
                Log.e("AppSize", "Error retrieving APK size for $packageName", e)
            }
    
            // ✅ Prevent invalid size inflation
            if (totalSize < 1_000 || totalSize > 100_000_000_000L) { // Ignore sizes <1KB or >100GB
                Log.e("AppSize", "Invalid size detected for $packageName: $totalSize bytes. Resetting to 0.")
                return 0L
            }
    
            return totalSize
        } catch (e: Exception) {
            Log.e("AppSize", "Error fetching size for $packageName", e)
            return 0L
        }
    }
    

    /**
     * Converts an app icon to a Base64 string for React Native.
     */
    private fun getAppIconBase64(app: ApplicationInfo, pm: PackageManager): String {
        return try {
            val drawable = pm.getApplicationIcon(app.packageName)
            val bitmap = Bitmap.createBitmap(
                drawable.intrinsicWidth.coerceAtLeast(1), // Ensure width is at least 1px
                drawable.intrinsicHeight.coerceAtLeast(1), // Ensure height is at least 1px
                Bitmap.Config.ARGB_8888
            )

            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)

            val outputStream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
            val byteArray = outputStream.toByteArray()

            "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP)
        } catch (e: Exception) {
            ""
        }
    }
}
