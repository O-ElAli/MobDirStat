import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  useWindowDimensions 
} from "react-native";
import { NativeModules } from "react-native";
import Svg, { Rect, G } from "react-native-svg";
import { treemap, hierarchy, treemapResquarify } from "d3-hierarchy";
import * as d3 from "d3-scale";

const { NativeModule } = NativeModules;

const MediaAnalysis = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const svgWidth = screenWidth * 0.9; // Use 90% of screen width
  const svgHeight = screenHeight * 0.6; // Use 60% of screen height

  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorageHierarchy = async () => {
      try {
        console.log("📢 Fetching Full Storage Hierarchy...");
        const result = await NativeModule.getStorageHierarchy();
        console.log("✅ Full Storage Hierarchy:", result);

        setStorageData(result);
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

  const root = hierarchy(storageData)
  .sum((d) => d.size > 500 * 1024 ? d.size : 500 * 1024) // Ensure even small files show up
  .sort((a, b) => b.value - a.value); // Sort by file size

  const tree = treemap()
    .size([svgWidth, svgHeight]) // Maximize space usage
    .tile(treemapResquarify) // Optimized layout similar to DiskUsage
    .padding(0); // Remove padding to eliminate gaps

  tree(root);

  // ✅ Color Scale for different folders
  const colorScale = d3.scaleOrdinal()
    .domain(root.children ? root.children.map((d) => d.data.name) : [])
    .range(["#BB86FC", "#6200EA", "#FF0266", "#FF9800", "#03DAC6", "#8BC34A", "#FFC107", "#FF5722"]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Breakdown</Text>

      <Svg width={svgWidth} height={svgHeight} style={styles.svg}>
        {root.leaves().map((leaf, index) => (
          <G key={index}>
            <Rect
              x={leaf.x0}
              y={leaf.y0}
              width={leaf.x1 - leaf.x0}
              height={leaf.y1 - leaf.y0}
              fill={colorScale(leaf.parent ? leaf.parent.data.name : "default") || "#757575"}
              stroke="#fff" // Thin inner border
              strokeWidth="0.3" // Light border to separate small squares
            />
          </G>
        ))}
      </Svg>
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
  svg: {
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
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
