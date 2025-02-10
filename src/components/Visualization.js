import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
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

  const leaves = useMemo(() => {
    try {
      const root = hierarchy({ children: apps })
        .sum(d => d.size || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      treemap()
        .size([width, height])
        .paddingInner(3)
        .paddingOuter(3)
        .round(true)(root);

      console.log("✅ Treemap generated with", root.leaves().length, "nodes");

      return root.leaves().filter(leaf => leaf.x1 - leaf.x0 > 5 && leaf.y1 - leaf.y0 > 5);
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
    <Svg width={width} height={height} style={{ borderWidth: 1, borderColor: 'black' }} key={forceUpdate}>
      {leaves.map((leaf, index) => {
        const appName = leaf.data.name;
        const w = leaf.x1 - leaf.x0;
        const h = leaf.y1 - leaf.y0;
        const isSelected = selectedApp === appName;

        console.log(`🟪 Drawing ${appName} at [${leaf.x0}, ${leaf.y0}, ${w}, ${h}]`);

        return (
          <G
            key={index}
            pointerEvents="auto" // Fix: changed from "all" to "auto"
            onPressIn={() => {
              setSelectedApp(appName);
              Alert.alert("App Selected", `App Name: ${appName}`);
            }}
          >
            <Rect
              x={leaf.x0}
              y={leaf.y0}
              width={w}
              height={h}
              fill="#BB86FC"
              stroke={isSelected ? "#FFFFFF" : "#6200EE"} // White border when selected
              strokeWidth={isSelected ? 3 : 2}
              opacity={0.9}
            />
          </G>
        );
      })}
    </Svg>
  );
};

Visualization.propTypes = {
  apps: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default Visualization;
