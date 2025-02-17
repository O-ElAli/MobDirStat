import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from "react-native";
import { NativeModules } from "react-native";
import MediaVisualization from "../components/MediaVisualization"; // Import new component

const { NativeModule } = NativeModules;

const MediaAnalysis = () => {
  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorageHierarchy = async () => {
      try {
        console.log("📢 Fetching Full Storage Hierarchy...");
        const result = await NativeModule.getStorageHierarchy();
  
        if (typeof result === "string") {
          console.warn("⚠ getStorageHierarchy returned a string. Parsing JSON...");
          setStorageData(JSON.parse(result)); // ✅ Ensure it's an object
        } else {
          setStorageData(result);
        }
  
        console.log("✅ Full Storage Hierarchy:", result);
      } catch (error) {
        console.error("🚨 Error fetching storage hierarchy:", error);
        Alert.alert("Error", "Failed to fetch storage hierarchy.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchStorageHierarchy();
  }, []);
  

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Fetching storage data...</Text>
      </View>
    );
  }

  if (!storageData || !storageData.children) {
    return (
      <View style={styles.container}>
        <Text style={styles.warning}>No storage data found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Breakdown</Text>
      <MediaVisualization storageData={storageData} /> {/* ✅ Pass data to the new component */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  warning: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
  },
});

export default MediaAnalysis;