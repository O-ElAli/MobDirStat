import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { NativeModules } from 'react-native';

const { NativeModule } = NativeModules;

const AppAnalysis = () => {
  const [apps, setApps] = useState([]);
  const [totalStorage, setTotalStorage] = useState(0);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const appsData = await NativeModule.getInstalledApps();
        console.log('Raw Apps Data:', appsData);

        const appsArray = appsData.split('\n').filter(line => line.trim() !== '');
        console.log('Parsed Apps Array:', appsArray);

        let total = 0;
        const appsList = appsArray.map(line => {
          const [app, size] = line.split(':');
          if (!size) {
            console.warn(`Skipping invalid line: ${line}`);
            return null;
          }

          const sizeMB = parseFloat(size.trim().split(' ')[0]);
          if (isNaN(sizeMB)) {
            console.warn(`Invalid size for app: ${line}`);
            return null;
          }

          total += sizeMB;
          return { name: app.trim(), size: sizeMB };
        }).filter(Boolean);

        setApps(appsList);
        setTotalStorage(total.toFixed(2));
      } catch (error) {
        console.error('Error fetching installed apps:', error);
      } finally {
        setLoading(false); // Stop loading after fetching
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Installed Apps Analysis</Text>
      <Text style={styles.data}>Total Storage Used: {totalStorage} MB</Text>
      {apps.map((app, index) => (
        <Text key={index} style={styles.app}>
          {app.name}: {app.size} MB
        </Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  data: {
    fontSize: 16,
    marginBottom: 20,
  },
  app: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default AppAnalysis;
