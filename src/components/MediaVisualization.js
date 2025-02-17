import React from "react";
import { View, Text } from "react-native";
import Svg, { Rect, G } from "react-native-svg";
import { treemap, hierarchy, treemapBinary } from "d3-hierarchy";
import * as d3 from "d3-scale";
import { useWindowDimensions } from "react-native";

const MediaVisualization = ({ storageData }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const svgWidth = screenWidth;
  const svgHeight = screenHeight * 0.75;

  if (!storageData || !storageData.children) {
    return <View><Text>No storage data available</Text></View>;
  }

  // Ensure all nodes have valid sizes
  const root = hierarchy(storageData)
    .sum((d) => d.size > 0 ? d.size : 1) // Prevent NaN values, default to 1 if size <= 0
    .sort((a, b) => b.value - a.value);

  const tree = treemap()
    .size([svgWidth, svgHeight])
    .tile(treemapBinary)
    .padding(2); // Increased padding for better separation

  tree(root);

  const colorScale = d3
    .scaleOrdinal(d3.schemeCategory10)
    .domain(root.leaves().map((d) => d.data.name));

  return (
    <View>
      <Svg width={svgWidth} height={svgHeight}>
        {root.leaves().map((leaf, index) => {
          const width = leaf.x1 - leaf.x0;
          const height = leaf.y1 - leaf.y0;
          if (width < 2 || height < 2) return null; // Avoid tiny boxes

          return (
            <G key={index}>
              <Rect
                x={leaf.x0}
                y={leaf.y0}
                width={width}
                height={height}
                fill={colorScale(leaf.parent ? leaf.parent.data.name : "default")}
                stroke="#000"
                strokeWidth="0.5"
              />
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

export default MediaVisualization;
