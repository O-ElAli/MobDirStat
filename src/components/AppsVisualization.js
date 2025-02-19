import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { treemap, hierarchy } from 'd3-hierarchy';
import PropTypes from 'prop-types';
import * as d3 from 'd3-scale';

const Visualization = ({ apps, filesystemStorage, systemStorage, width, height, onSelectApp }) => {
  const [renderCount, setRenderCount] = useState(0);

  // Log only when re-rendering occurs
  useEffect(() => {
    console.log("🔄 Visualization re-rendering...");
    setRenderCount(prev => prev + 1);
  }, []);

  // Memoized total size calculation
  const totalSize = useMemo(() => {
    return apps.reduce((sum, app) => sum + (app.totalSize || 0), 0);
  }, [apps]);

  // Memoized treemap hierarchy
  const root = useMemo(() => {
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
  }, [apps, filesystemStorage, systemStorage]);

  // Prevent rendering if root fails
  if (!root) {
    return <Text style={{ color: 'red', fontSize: 16 }}>No valid data for visualization.</Text>;
  }

  // Memoized treemap layout
  const treemapLayout = useMemo(() => {
    return treemap()
      .size([width, height])
      .round(true)
      .paddingOuter(0)
      .paddingInner(0);
  }, [width, height]);

  // Memoized node calculations
  const nodes = useMemo(() => {
    if (!root) return [];
    treemapLayout(root);
    return root.descendants();
  }, [root, treemapLayout]);

  // Memoized onPress event handler
  const handlePress = useCallback((node) => {
    if (node.depth > 1) {
      onSelectApp({
        name: node.data.name,
        packageName: node.data.packageName, // Add packageName
        size: parseFloat(node.data.size.toFixed(2)),
        percentage: totalSize > 0 ? parseFloat(((node.data.size / totalSize) * 100).toFixed(2)) : 0,
      });
    }
  }, [onSelectApp, totalSize]);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {nodes.map((node, index) => {
          const parentCategory = node.parent?.data?.name;
          const isFilesystem = parentCategory === "Filesystem";
          const isSystem = parentCategory === "System";

          return (
            <G key={index} onPressIn={() => handlePress(node)}>
              <Rect
                x={node.x0}
                y={node.y0}
                width={node.x1 - node.x0}
                height={node.y1 - node.y0}
                fill={
                  isFilesystem ? "#99CC00" : 
                  isSystem ? "#3399FF" :       
                  d3.scaleLinear().domain([0, totalSize]).range(["#FF5733", "#33FF57"])(node.data.size)
                }
                stroke={node.depth === 1 ? "#ffffff" : "#6200EE"}
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
