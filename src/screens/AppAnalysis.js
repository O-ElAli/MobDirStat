import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  useWindowDimensions 
} from 'react-native';
import { NativeModules } from 'react-native';
import Visualization from '../components/Visualization';

const { NativeModule } = NativeModules;

const AppAnalysis = () => {
  const [apps, setApps] = useState([]);
  const [totalStorage, setTotalStorage] = useState(0);
  const [loading, setLoading] = useState(true);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const visHeight = windowHeight * 0.6; // 60% of screen height

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const appsData = await NativeModule.getInstalledApps();
        if (typeof appsData !== "string") {
          console.error("Error: Expected a string from NativeModule.getInstalledApps, got:", typeof appsData);
          return;
        }    
        const appsArray = appsData.split('\n').filter(line => line.trim() !== '');
    
        let total = 0;
        const appsList = appsArray
          .map(line => {
            const lastColonIndex = line.lastIndexOf(':');
            if (lastColonIndex === -1) return null;

            const appInfo = line.substring(0, lastColonIndex).trim();
            const sizePart = line.substring(lastColonIndex + 1).trim();
            
            const appParts = appInfo.split('|||').map(s => s.trim());
            if (appParts.length !== 2) return null;

            const [appName, packageName] = appParts;
            const sizeMB = parseFloat(sizePart);

            if (isNaN(sizeMB) || sizeMB <= 0) return null;

            total += sizeMB;
            return { 
              name: `${appName} (${packageName})`, 
              size: sizeMB 
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.size - a.size);

        setApps(appsList);
        setTotalStorage(total.toFixed(2));
      } catch (error) {
        Alert.alert('Error', 'Failed to load app data');
        console.error('Error fetching apps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
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
      {/* Top 40% - Title & Summary */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>Installed Apps Analysis</Text>
        <Text style={styles.data}>
          Total Storage: {totalStorage} MB ({apps.length} apps)
        </Text>
      </View>

      {/* Bottom 60% - Visualization */}
      <View style={styles.visualizationContainer}>
        <Visualization 
          apps={apps.filter(app => app.size > 1)} 
          width={windowWidth}
          height={visHeight}
        />
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>
          Color Intensity = App Size (Darker = Larger)
        </Text>
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
  },
  legendText: {
    fontSize: 12,
    color: '#495057',
    fontStyle: 'italic',
  },
});

export default AppAnalysis;
