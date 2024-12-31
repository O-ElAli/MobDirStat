import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeModules } from 'react-native';

const { NativeModule } = NativeModules;

const AppAnalysis = () => {
  const [apps, setApps] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const appsData = await NativeModule.getInstalledApps();
        setApps(appsData);
      } catch (error) {
        console.error('Error fetching installed apps:', error);
      }
    };

    fetchApps();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Installed Apps Analysis</Text>
      <Text style={styles.data}>{apps}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  data: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default AppAnalysis;
