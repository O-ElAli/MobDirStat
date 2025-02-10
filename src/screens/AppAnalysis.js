import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
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
  
  const visWidth = windowWidth - 40;
  const visHeight = windowHeight * 0.5;

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const appsData = await NativeModule.getInstalledApps();
        console.log("Raw appsData:", appsData);
    
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
            
            // Add validation for the delimiter
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
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Installed Apps Analysis</Text>
      <Text style={styles.data}>
        Total Storage: {totalStorage} MB ({apps.length} apps)
      </Text>

      <Visualization 
        apps={apps.filter(app => app.size > 1)} 
        width={visWidth}
        height={visHeight}
      />
      
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          Color Intensity = App Size (Darker = Larger)
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  data: {
    fontSize: 16,
    marginBottom: 25,
    color: '#666',
  },
  svgContainer: {
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#888',
  },
  warning: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  legend: {
    marginTop: 20,
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
