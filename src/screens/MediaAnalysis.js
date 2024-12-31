import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeModules } from 'react-native';

const { NativeModule } = NativeModules;

const MediaAnalysis = () => {
  const [mediaData, setMediaData] = useState(null);

  useEffect(() => {
    const fetchMediaAnalysis = async () => {
      try {
        const result = await NativeModules.NativeModule.getDetailedMediaAnalysis();
        console.log('Media Analysis Result:', result);
        setMediaData(result);
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Media Storage Analysis</Text>
      <Text style={styles.data}>Images Size: {mediaData.imagesSize} MB</Text>
      <Text style={styles.data}>Videos Size: {mediaData.videosSize} MB</Text>
      <Text style={styles.title}>Documents</Text>
      {mediaData.documents && mediaData.documents.length > 0 ? (
        mediaData.documents.map((doc, index) => (
          <View key={index} style={styles.document}>
            <Text>Name: {doc.name}</Text>
            <Text>Size: {doc.size} MB</Text>
            <Text>Type: {doc.type}</Text>
          </View>
        ))
      ) : (
        <Text>No documents found.</Text>
      )}
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
    marginBottom: 10,
  },
  document: {
    marginBottom: 15,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default MediaAnalysis;
