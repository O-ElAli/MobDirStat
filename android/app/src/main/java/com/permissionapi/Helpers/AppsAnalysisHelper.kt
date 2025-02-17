package com.permissionapi.helpers

import android.app.AppOpsManager
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.Build
import android.util.Base64
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
     * Retrieves a list of installed apps, their total storage usage, and icons.
     */
    fun getInstalledAppsWithSizes(): WritableArray {
        val pm: PackageManager = context.packageManager
        val apps = pm.getInstalledApplications(PackageManager.GET_META_DATA)
        val appList = Arguments.createArray()
        
        for (app in apps) {
            try {
                val appInfo = pm.getApplicationInfo(app.packageName, PackageManager.GET_META_DATA)
                val appName = pm.getApplicationLabel(appInfo).toString()
                val packageName = appInfo.packageName
                val appSizes = getAppStorageSizes(packageName)
                val appIconBase64 = getAppIconBase64(appInfo, pm)
        
                if (appSizes.totalSize > 0) {
                    val appData = Arguments.createMap()
                    appData.putString("name", appName)
                    appData.putString("packageName", packageName)
                    appData.putDouble("apkSize", appSizes.apkSize / (1024.0 * 1024.0)) // MB
                    appData.putDouble("cacheSize", appSizes.cacheSize / (1024.0 * 1024.0)) // MB
                    appData.putDouble("externalCacheSize", appSizes.externalCacheSize / (1024.0 * 1024.0)) // MB
                    appData.putDouble("dataSize", appSizes.dataSize / (1024.0 * 1024.0)) // MB
                    appData.putDouble("totalSize", appSizes.totalSize / (1024.0 * 1024.0)) // MB
                    appData.putString("icon", appIconBase64)
        
                    appList.pushMap(appData)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        return appList
    }

    /**
     * Retrieves detailed storage stats for an app, including APK, cache, data, and external cache.
     */
    private fun getAppStorageSizes(packageName: String): AppStorageSizes {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val storageStatsManager = context.getSystemService(Context.STORAGE_STATS_SERVICE) as android.app.usage.StorageStatsManager
                val storageManager = context.getSystemService(Context.STORAGE_SERVICE) as android.os.storage.StorageManager
                val uuid = storageManager.getUuidForPath(context.filesDir)
                val storageStats = storageStatsManager.queryStatsForPackage(uuid, packageName, Process.myUserHandle())
                
                AppStorageSizes(
                    apkSize = storageStats.appBytes,
                    cacheSize = storageStats.cacheBytes,
                    externalCacheSize = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) storageStats.externalCacheBytes else 0L,
                    dataSize = storageStats.dataBytes,
                    totalSize = storageStats.appBytes + storageStats.cacheBytes + storageStats.dataBytes +
                                (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) storageStats.externalCacheBytes else 0L)
                )
            } else {
                val packageInfo = context.packageManager.getPackageInfo(packageName, 0)
                val sourceDir = packageInfo.applicationInfo?.sourceDir
                val apkSize = if (sourceDir != null) java.io.File(sourceDir).length() else 0L
                AppStorageSizes(apkSize, 0L, 0L, 0L, apkSize)
            }
        } catch (e: Exception) {
            AppStorageSizes(0L, 0L, 0L, 0L, 0L)
        }
    }

    /**
     * Retrieves total filesystem storage usage.
     */
    fun getFilesystemStorage(): Long {
        return FsScanner().scan(File("/storage/emulated/0")) // Adjust path if needed
    }

    /**
     * Retrieves system storage usage.
     */
    fun getSystemStorageUsage(): Long {
        return SystemScanner(context).getSystemStorageUsage()
    }
}

/**
 * Data class to store app storage information.
 */
data class AppStorageSizes(
    val apkSize: Long,
    val cacheSize: Long,
    val externalCacheSize: Long,
    val dataSize: Long,
    val totalSize: Long
)
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

/**
 * Filesystem Scanner
 */
class FsScanner {
    fun scan(directory: File): Long {
        var totalSize = 0L
        directory.listFiles()?.forEach {
            totalSize += if (it.isDirectory) scan(it) else it.length()
        }
        return totalSize
    }
}

/**
 * System Storage Scanner
 */
class SystemScanner(private val context: Context) {
    fun getSystemStorageUsage(): Long {
        val totalSpace = File("/").totalSpace
        val freeSpace = File("/").freeSpace
        return totalSpace - freeSpace
    }
}