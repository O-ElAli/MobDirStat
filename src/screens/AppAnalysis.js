import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  useWindowDimensions, 
  Animated 
} from 'react-native';
import { NativeModules } from 'react-native';
import Visualization from '../components/Visualization';

const { NativeModule } = NativeModules;

const AppAnalysis = () => {
  const [apps, setApps] = useState([]);
  const [totalStorage, setTotalStorage] = useState(0);
  const [loading, setLoading] = useState(true);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  const visHeight = windowHeight * 0.6;

  // Animated fade-out effect for legend
  const legendOpacity = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        // Fetch installed apps with their full storage breakdown
        const appsData = await NativeModule.getInstalledApps();
        
        if (!Array.isArray(appsData)) {
          console.error("Error: Expected an array from NativeModule.getInstalledApps, got:", typeof appsData);
          return;
        }
  
        let totalAppStorage = 0;
        const appsList = appsData
          .map(app => {
            if (!app.name || !app.packageName || isNaN(app.totalSize)) return null;
  
            totalAppStorage += app.totalSize;
            return { 
              name: app.name,
              packageName: app.packageName,
              apkSize: app.apkSize,
              cacheSize: app.cacheSize,
              externalCacheSize: app.externalCacheSize,
              dataSize: app.dataSize,
              totalSize: app.totalSize,
              icon: app.icon || "" // Base64 icon
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.totalSize - a.totalSize);
  
        // Fetch filesystem storage
        const filesystemStorage = await NativeModule.getFilesystemStorage();
        
        // Fetch system storage
        const systemStorage = await NativeModule.getSystemStorageUsage();
  
        setApps(appsList);
        setTotalStorage({
          apps: totalAppStorage.toFixed(2),
          filesystem: filesystemStorage.toFixed(2),
          system: systemStorage.toFixed(2),
        });
  
      } catch (error) {
        Alert.alert('Error', 'Failed to load storage data');
        console.error('Error fetching storage data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchStorageData();
  }, []);
  

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Analyzing installed apps...</Text>
      </View>
    );
  }

  if (!apps.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.warning}>No apps with valid size data found</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>Installed Apps Analysis</Text>
        <Text style={styles.data}>
          Apps: {totalStorage.apps} MB ({apps.length} apps) {"\n"}
          Filesystem: {totalStorage.filesystem} MB {"\n"}
          System: {totalStorage.system} MB
        </Text>

      </View>

      <View style={styles.visualizationContainer}>
      <Visualization 
        apps={apps.filter(app => app.totalSize > 1)} 
        filesystemStorage={parseFloat(totalStorage.filesystem) || 0}
        systemStorage={parseFloat(totalStorage.system) || 0}
        width={windowWidth}
        height={visHeight}
      />


      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020203',
    padding: 20,
  },
  infoContainer: {
    flex: 0.4, // 40% of the screen height
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    color: '#ebd8d8',
  },
  data: {
    fontSize: 16,
    marginBottom: 10,
    color: '#ccc',
  },
  visualizationContainer: {
    flex: 0.6, // 60% of the screen height
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  warning: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  legend: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    position: 'absolute',
    bottom: 20, // Keeps it above the visualization
    alignSelf: 'center',
  },
  legendText: {
    fontSize: 12,
    color: '#495057',
    fontStyle: 'italic',
  },
});

export default AppAnalysis;