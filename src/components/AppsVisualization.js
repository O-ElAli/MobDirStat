import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { treemap, hierarchy } from 'd3-hierarchy';
import PropTypes from 'prop-types';
import * as d3 from 'd3-scale';

const Visualization = ({ apps, filesystemStorage, systemStorage, width, height, onSelectApp }) => {
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  if (!Array.isArray(apps) || apps.length === 0) {
    return <Text style={{ color: 'red', fontSize: 16 }}>No valid data for visualization.</Text>;
  }

  const totalSize = apps.reduce((sum, app) => sum + (app.totalSize || 0), 0);

  // ✅ Fixed: No interpolation function, just range mapping
  const dynamicColorScale = d3.scaleLinear()
    .domain([0, totalSize])
    .range(["#FF5733", "#33FF57"]); // Red → Green

  const root = useMemo(() => {
    try {
      return hierarchy({
        name: "Storage",
        children: [
          {
            name: "Apps",
            children: apps.length > 0
              ? apps.map(app => ({
                  name: app.name,
                  packageName: app.packageName,
                  size: parseFloat(app.totalSize) || 1,
                }))
              : [{ name: "No Apps", size: 1 }]
          },
          {
            name: "Filesystem",
            children: [
              { name: "Filesystem Storage", size: parseFloat(filesystemStorage) || 1 }
            ]
          },
          {
            name: "System",
            children: [
              { name: "System Storage", size: parseFloat(systemStorage) || 1 }
            ]
          }
        ]
      })
      .sum(d => d.size || 1)
      .sort((a, b) => (b.value || 0) - (a.value || 0));
    } catch (error) {
      console.error("❌ Error in Treemap Hierarchy:", error);
      return null;
    }
  }, [apps, filesystemStorage, systemStorage]);

  const treemapLayout = treemap()
    .size([width, height])
    .round(true) 
    .paddingOuter(0) 
    .paddingInner(0); 

  const nodes = useMemo(() => {
    if (!root) return [];
    treemapLayout(root);
    return root.descendants();
  }, [root]);

  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        setLoading(false);
        setForceUpdate(prev => prev + 1);
      }, 500);
    }
  }, [nodes]);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} key={forceUpdate}>
        {nodes.map((node, index) => {
          const parentCategory = node.parent?.data?.name;
          const isFilesystem = parentCategory === "Filesystem";
          const isSystem = parentCategory === "System";

          return (
            <G
              key={index}
              onPressIn={() => {
                if (node.depth > 1) {
                  onSelectApp({
                    name: node.data.name,
                    size: parseFloat(node.data.size.toFixed(2)),
                    percentage: totalSize > 0 ? parseFloat(((node.data.size / totalSize) * 100).toFixed(2)) : 0,
                  });
                }
              }}
            >
              <Rect
                x={node.x0}
                y={node.y0}
                width={node.x1 - node.x0}
                height={node.y1 - node.y0}
                fill={
                  isFilesystem ? "#99CC00" :   // Green for Filesystem
                  isSystem ? "#3399FF" :       // Blue for System
                  dynamicColorScale(node.data.size)
                }    
                stroke={node.depth === 1 ? "#ffffff" : "#6200EE"} // Highlights category borders
                strokeWidth={node.depth === 1 ? 3 : 2}
                opacity={0.9}
              />
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

Visualization.propTypes = {
  apps: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  onSelectApp: PropTypes.func.isRequired,
};

export default Visualization;
