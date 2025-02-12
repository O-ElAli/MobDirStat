import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Pressable, Modal, Image, StyleSheet } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { treemap, hierarchy } from 'd3-hierarchy';
import PropTypes from 'prop-types';
import * as d3 from 'd3-scale';

const Visualization = ({ apps, width, height }) => {
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [selectedApp, setSelectedApp] = useState(null);

  if (!Array.isArray(apps) || apps.length === 0) {
    return <Text style={{ color: 'red', fontSize: 16 }}>No valid data for visualization.</Text>;
  }

  const totalSize = apps.reduce((sum, app) => sum + (app.size || 0), 0);
  const maxAppSize = Math.max(...apps.map(app => app.size));

  // Dynamic color scale: Larger apps are darker
  const colorScale = d3.scaleLinear()
    .domain([0, maxAppSize])
    .range(["#D3BDF2", "#6200EE"]);

  const leaves = useMemo(() => {
    try {
      const root = hierarchy({ children: apps })
        .sum(d => d.size || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      treemap()
        .size([width, height])
        .padding(2)
        .round(true)(root);

      return root.leaves();
    } catch (error) {
      console.error("❌ Treemap error:", error);
      return [];
    }
  }, [apps, width, height]);

  useEffect(() => {
    if (leaves.length > 0) {
      setTimeout(() => {
        setLoading(false);
        setForceUpdate(prev => prev + 1);
      }, 500);
    }
  }, [leaves]);

  if (loading) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', height }}>
        <ActivityIndicator size="large" color="#BB86FC" />
        <Text style={{ marginTop: 10, color: '#666' }}>Generating Visualization...</Text>
      </View>
    );
  }

  return (
    <View>
      <Pressable style={{ width, height }} onPress={() => setSelectedApp(null)}>
        <Svg width={width} height={height} key={forceUpdate}>
          {leaves.map((leaf, index) => {
            const appName = leaf.data.name;
            const appSize = leaf.data.size;
            const percentage = ((appSize / totalSize) * 100).toFixed(2);
            const isSelected = selectedApp && selectedApp.name === appName;
            const appIconUri = `https://logo.clearbit.com/${leaf.data.packageName}.com`; // Replace this with actual app icon source

            return (
              <G
                key={index}
                onPressIn={() => {
                  setSelectedApp({
                    name: appName,
                    size: appSize,
                    percentage: percentage,
                    icon: appIconUri, // Icon placeholder
                  });
                }}
              >
                <Rect
                  x={leaf.x0}
                  y={leaf.y0}
                  width={leaf.x1 - leaf.x0}
                  height={leaf.y1 - leaf.y0}
                  fill={colorScale(appSize)}
                  stroke={isSelected ? "#FFFFFF" : "#6200EE"}
                  strokeWidth={isSelected ? 3 : 2}
                  opacity={0.9}
                />
              </G>
            );
          })}
        </Svg>
      </Pressable>

      {/* Custom Modal for App Details */}
      {selectedApp && (
        <Modal
          visible={!!selectedApp}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedApp(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedApp.icon ? (
                <Image source={{ uri: selectedApp.icon }} style={styles.appIcon} />
              ) : (
                <View style={styles.placeholderIcon} />
              )}
              <Text style={styles.appName}>{selectedApp.name}</Text>
              <Text style={styles.appDetails}>
                Size: {selectedApp.size} MB {"\n"}
                Space Taken: {selectedApp.percentage}%
              </Text>
              <Pressable style={styles.closeButton} onPress={() => setSelectedApp(null)}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

Visualization.propTypes = {
  apps: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: 250,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginBottom: 10,
  },
  placeholderIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  appDetails: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#6200EE",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Visualization;
