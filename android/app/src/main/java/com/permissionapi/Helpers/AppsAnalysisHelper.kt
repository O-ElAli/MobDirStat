package com.permissionapi.helpers

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build

class AppsAnalysisHelper(private val context: Context) {

    fun hasUsageStatsPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as android.app.AppOpsManager
        val mode = appOps.checkOpNoThrow(
            android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            context.packageName
        )
        return mode == android.app.AppOpsManager.MODE_ALLOWED
    }

    fun getInstalledAppsWithSizes(): String {
        val pm: PackageManager = context.packageManager
        val apps = pm.getInstalledApplications(PackageManager.GET_META_DATA)
        val appDetailsList = mutableListOf<Pair<String, Long>>()

        for (app in apps) {
            val appName = pm.getApplicationLabel(app).toString()
            val packageName = app.packageName
            val appSize = getAppSizeInBytes(packageName)
            
            // Use a unique delimiter that won't appear in app names
            appDetailsList.add(Pair("$appName|||$packageName", appSize))
        }
    
        appDetailsList.sortByDescending { it.second }
    
        val appDetails = StringBuilder()
        for ((appInfo, size) in appDetailsList) {
            // Skip apps with 0 size
            if (size > 0) {
                appDetails.append("$appInfo:${size / (1024 * 1024)}\n")
            }
        }
        return appDetails.toString()
    }

    private fun getAppSizeInBytes(packageName: String): Long {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val storageStatsManager = context.getSystemService(Context.STORAGE_STATS_SERVICE) as android.app.usage.StorageStatsManager
                val storageManager = context.getSystemService(Context.STORAGE_SERVICE) as android.os.storage.StorageManager
                val uuid = storageManager.getUuidForPath(context.filesDir)
                val storageStats = storageStatsManager.queryStatsForPackage(uuid, packageName, android.os.Process.myUserHandle())
                storageStats.appBytes
            } else {
                val packageInfo = context.packageManager.getPackageInfo(packageName, 0)
                val sourceDir = packageInfo.applicationInfo?.sourceDir
                if (sourceDir != null) {
                    val file = java.io.File(sourceDir)
                    file.length()
                } else {
                    0L
                }
            }
        } catch (e: Exception) {
            0L
        }
    }
}
