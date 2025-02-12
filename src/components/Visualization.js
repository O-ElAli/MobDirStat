import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, Pressable } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { treemap, hierarchy } from 'd3-hierarchy';
import PropTypes from 'prop-types';
import * as d3 from 'd3-scale'; // Import d3-scale for color mapping

const Visualization = ({ apps, width, height }) => {
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [selectedApp, setSelectedApp] = useState(null);

  if (!Array.isArray(apps) || apps.length === 0) {
    return <Text style={{ color: 'red', fontSize: 16 }}>No valid data for visualization.</Text>;
  }

  const totalSize = apps.reduce((sum, app) => sum + (app.size || 0), 0);
  const maxAppSize = Math.max(...apps.map(app => app.size)); // Find the largest app size

  // Define a color scale from light purple (small apps) to dark purple (large apps)
  const colorScale = d3.scaleLinear()
    .domain([0, maxAppSize])  // Map size from 0 to max size
    .range(["#D3BDF2", "#6200EE"]); // Light purple to dark purple

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
    <Pressable
      style={{ width, height }}
      onPress={() => setSelectedApp(null)}
    >
      <Svg width={width} height={height} key={forceUpdate}>
        {leaves.map((leaf, index) => {
          const appName = leaf.data.name;
          const appSize = leaf.data.size;
          const percentage = ((appSize / totalSize) * 100).toFixed(2);
          const isSelected = selectedApp === appName;

          return (
            <G
              key={index}
              onPressIn={() => {
                setSelectedApp(appName);
                Alert.alert("App Selected", `App: ${appName}\nSize: ${appSize} MB\nSpace Taken: ${percentage}%`);
              }}
            >
              <Rect
                x={leaf.x0}
                y={leaf.y0}
                width={leaf.x1 - leaf.x0}
                height={leaf.y1 - leaf.y0}
                fill={colorScale(appSize)} // Set color intensity based on app size
                stroke={isSelected ? "#FFFFFF" : "#6200EE"}
                strokeWidth={isSelected ? 3 : 2}
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
