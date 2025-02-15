import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, useWindowDimensions } from 'react-native';
import { NativeModules } from 'react-native';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { treemap, hierarchy } from 'd3-hierarchy';
import * as d3 from 'd3-scale';

const { NativeModule } = NativeModules;

const MediaAnalysis = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const svgWidth = screenWidth * 0.9;  // 90% of screen width
  const svgHeight = screenHeight * 0.55; // 55% of screen height

  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMediaAnalysis = async () => {
      try {
        console.log("📢 Fetching Media Analysis...");
        const result = await NativeModule.getDetailedMediaAnalysis();
        console.log("✅ Media Analysis Result:", result);
        setMediaData(result);
      } catch (error) {
        console.error("🚨 Error fetching media analysis:", error);
        Alert.alert("Error", "Failed to fetch media analysis.");
      } finally {
        setLoading(false);
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

  if (!mediaData || !mediaData.imagesSize || !mediaData.videosSize) {
    return (
      <View style={styles.container}>
        <Text style={styles.warning}>No media data found.</Text>
      </View>
    );
  }

  // Convert data to hierarchy
  const data = {
    name: "Media Storage",
    children: [
      { name: "Images", size: mediaData.imagesSize },
      { name: "Videos", size: mediaData.videosSize },
    ],
  };

  const root = hierarchy(data)
    .sum((d) => d.size)
    .sort((a, b) => b.value - a.value); // Larger sizes at the top

  const tree = treemap().size([svgWidth, svgHeight]).padding(3);
  tree(root);

  // Color Scale for rectangles
  const colorScale = d3.scaleOrdinal()
    .domain(["Images", "Videos"])
    .range(["#BB86FC", "#FF0266"]); // Purple → Red

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Media Storage Analysis</Text>
      
      <Svg width={svgWidth} height={svgHeight} style={styles.svg}>
        {root.leaves().map((leaf, index) => (
          <G key={index}>
            <Rect
              x={leaf.x0}
              y={leaf.y0}
              width={leaf.x1 - leaf.x0}
              height={leaf.y1 - leaf.y0}
              fill={colorScale(leaf.data.name)}
              stroke="#fff"
              strokeWidth="2"
            />
            {leaf.x1 - leaf.x0 > 50 && leaf.y1 - leaf.y0 > 20 && (
              <SvgText
                x={(leaf.x0 + leaf.x1) / 2}
                y={(leaf.y0 + leaf.y1) / 2}
                fontSize="14"
                fill="white"
                textAnchor="middle"
              >
                {leaf.data.name} ({leaf.data.size.toFixed(2)} MB)
              </SvgText>
            )}
          </G>
        ))}
      </Svg>
      
      <Text style={styles.legend}>
        🔵 Images ({mediaData.imagesSize.toFixed(2)} MB) | 🔴 Videos ({mediaData.videosSize.toFixed(2)} MB)
      </Text>
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
  legend: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default MediaAnalysis;
