import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeModules } from 'react-native';

const { NativeModule } = NativeModules;

const MediaAnalysis = () => {
  const [mediaData, setMediaData] = useState(null);

  useEffect(() => {
    const fetchMediaAnalysis = async () => {
      try {
        const result = await NativeModule.getDetailedMediaAnalysis();
        console.log('Media Analysis Result:', result); // Log the result
        setMediaData(result); // Save result in state
      } catch (error) {
        console.error('Error fetching media analysis:', error);
        Alert.alert('Error', 'Failed to fetch media analysis.');
      }
    };

    fetchMediaAnalysis();
  }, []);

  if (!mediaData) {
    return (
      <View style={styles.container}>
        <Text>Loading media analysis...</Text>
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
});

export default MediaAnalysis;
