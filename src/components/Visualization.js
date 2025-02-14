import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { treemap, hierarchy } from 'd3-hierarchy';
import PropTypes from 'prop-types';
import * as d3 from 'd3-scale';
import AppDetailsModal from './AppDetailsModal'; // Import the new modal component

const Visualization = ({ apps, filesystemStorage, systemStorage, width, height }) => {
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [selectedApp, setSelectedApp] = useState(null);

  if (!Array.isArray(apps) || apps.length === 0) {
    return <Text style={{ color: 'red', fontSize: 16 }}>No valid data for visualization.</Text>;
  }

  const totalSize = apps.reduce((sum, app) => sum + (app.size || 0), 0);
  const maxAppSize = Math.max(...apps.map(app => app.size));

  // Dynamic color scale: Larger apps are darker
  const colorScale = d3.scaleOrdinal()
  .domain(["Apps", "Filesystem", "System"])
  .range(["#6200EE", "#FF9800", "#4CAF50"]);


  const leaves = useMemo(() => {
    if (!apps.length && !filesystemStorage && !systemStorage) {
      return [];
    }
  
    try {
      const root = hierarchy({
        name: "Storage",
        children: [
          {
            name: "Apps",
            children: apps.length > 0 
              ? apps.map(app => ({
                  name: app.name,
                  packageName: app.packageName,
                  size: app.totalSize || 1,
                }))
              : [{ name: "No Apps", size: 1 }]
          },
          { name: "Filesystem", size: filesystemStorage || 1 }, 
          { name: "System", size: systemStorage || 1 }
        ]
      })
      .sum(d => d.size || 1)
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
  }, [apps, filesystemStorage, systemStorage, width, height]);
  

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
            const isCategory = leaf.children; // Check if this is a category
            return (
              <G
                key={index}
                onPressIn={() => {
                  if (!isCategory) {
                    setSelectedApp({
                      name: leaf.data.name,
                      size: parseFloat(leaf.data.size.toFixed(2)),
                      percentage: totalSize > 0 ? parseFloat(((leaf.data.size / totalSize) * 100).toFixed(2)) : 0,
                    });
                  }
                }}
              >
                <Rect
                  x={leaf.x0}
                  y={leaf.y0}
                  width={leaf.x1 - leaf.x0}
                  height={leaf.y1 - leaf.y0}
                  fill={leaf.data.name === "Filesystem" ? "#FF9800" : 
                        leaf.data.name === "System" ? "#4CAF50" : 
                        isCategory ? "#888888" : colorScale(leaf.data.size)}
                  stroke="#6200EE"
                  strokeWidth={isCategory ? 3 : 2}
                  opacity={isCategory ? 1 : 0.9}
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