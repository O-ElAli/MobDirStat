import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, Pressable } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { treemap, hierarchy } from 'd3-hierarchy';
import PropTypes from 'prop-types';

const Visualization = ({ apps, width, height }) => {
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [selectedApp, setSelectedApp] = useState(null);

  console.log("🔍 Received apps in Visualization:", apps.length, "apps");

  if (!Array.isArray(apps) || apps.length === 0) {
    console.error("⚠️ Apps array is invalid:", apps);
    return <Text style={{ color: 'red', fontSize: 16 }}>No valid data for visualization.</Text>;
  }

  const totalSize = apps.reduce((sum, app) => sum + (app.size || 0), 0);

  const leaves = useMemo(() => {
    try {
      const root = hierarchy({ children: apps })
        .sum(d => d.size || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      treemap()
        .size([width, height])
        .padding(1) // Ensuring full coverage
        .round(true)(root);

      console.log("✅ Treemap generated with", root.leaves().length, "nodes");

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

  if (leaves.length === 0) {
    return <Text style={{ color: 'red', fontSize: 16 }}>Treemap failed to generate.</Text>;
  }

  return (
    <Pressable
      style={{ width, height }}
      onPress={() => {
        console.log("🟢 Clicked outside, deselecting...");
        setSelectedApp(null);
      }}
    >
      <Svg width={width} height={height} style={{ borderWidth: 1, borderColor: 'black' }} key={forceUpdate}>
        {leaves.map((leaf, index) => {
          const appName = leaf.data.name;
          const appSize = leaf.data.size;
          const percentage = ((appSize / totalSize) * 100).toFixed(2);
          const w = leaf.x1 - leaf.x0;
          const h = leaf.y1 - leaf.y0;
          const isSelected = selectedApp === appName;

          console.log(`🟪 Drawing ${appName} at [${leaf.x0}, ${leaf.y0}, ${w}, ${h}]`);

          return (
            <G
              key={index}
              pointerEvents="auto"
              onPressIn={(e) => {
                e.stopPropagation(); // Prevents deselection when clicking a square
                setSelectedApp(appName);
                Alert.alert("App Selected", `App: ${appName}\nSize: ${appSize} MB\nSpace Taken: ${percentage}%`);
              }}
            >
              <Rect
                x={leaf.x0}
                y={leaf.y0}
                width={w}
                height={h}
                fill="#BB86FC" // Keeps the purple/pink fill
                stroke={isSelected ? "#FFFFFF" : "#6200EE"} // White outline when selected
                strokeWidth={isSelected ? 3 : 2} // Slightly thicker border when selected
                opacity={0.9}
              />
            </G>
          );
        })}
      </Svg>
    </Pressable>
  );
};

Visualization.propTypes = {
  apps: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default Visualization;
