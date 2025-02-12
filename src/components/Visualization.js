import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { treemap, hierarchy } from 'd3-hierarchy';
import PropTypes from 'prop-types';
import * as d3 from 'd3-scale';
import AppDetailsModal from './AppDetailsModal'; // Import the new modal component

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

  return (
    <View>
      <Pressable style={{ width, height }} onPress={() => setSelectedApp(null)}>
        <Svg width={width} height={height} key={forceUpdate}>
          {leaves.map((leaf, index) => {
            const appName = leaf.data.name;
            const appSize = leaf.data.size;
            const percentage = ((appSize / totalSize) * 100).toFixed(2);
            const appIconUri = `https://logo.clearbit.com/${leaf.data.packageName}.com`; // Placeholder for app icons

            return (
              <G
                key={index}
                onPressIn={() => {
                  setSelectedApp({
                    name: appName,
                    size: appSize,
                    percentage: percentage,
                    icon: appIconUri, // App icon
                  });
                }}
              >
                <Rect
                  x={leaf.x0}
                  y={leaf.y0}
                  width={leaf.x1 - leaf.x0}
                  height={leaf.y1 - leaf.y0}
                  fill={colorScale(appSize)}
                  stroke="#6200EE"
                  strokeWidth={2}
                  opacity={0.9}
                />
              </G>
            );
          })}
        </Svg>
      </Pressable>

      {/* Use the new AppDetailsModal component */}
      <AppDetailsModal 
        visible={!!selectedApp} 
        app={selectedApp} 
        onClose={() => setSelectedApp(null)} 
      />
    </View>
  );
};

Visualization.propTypes = {
  apps: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default Visualization;