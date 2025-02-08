import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { NativeModules } from 'react-native';

const { NativeModule } = NativeModules;

const MediaAnalysis = () => {
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMediaAnalysis = async () => {
      try {
        const result = await NativeModule.getDetailedMediaAnalysis();
        console.log('Media Analysis Result:', result);
        setMediaData(result);
      } catch (error) {
        console.error('Error fetching media analysis:', error);
        Alert.alert('Error', 'Failed to fetch media analysis.');
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching
      }
    };

    fetchMediaAnalysis();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Fetching media analysis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Media Storage Analysis</Text>
      <Text style={styles.data}>Images Size: {mediaData.imagesSize} MB</Text>
      <Text style={styles.data}>Videos Size: {mediaData.videosSize} MB</Text>
      <Text style={styles.data}>Message: {mediaData.message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default MediaAnalysis;
