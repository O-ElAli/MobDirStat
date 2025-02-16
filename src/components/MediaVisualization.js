import React from "react";
import { View } from "react-native";
import Svg, { Rect, G } from "react-native-svg";
import { treemap, hierarchy, treemapResquarify } from "d3-hierarchy";
import * as d3 from "d3-scale";
import { useWindowDimensions } from "react-native";

const MediaVisualization = ({ storageData }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const svgWidth = screenWidth * 0.9;
  const svgHeight = screenHeight * 0.6;

  if (!storageData || !storageData.children) {
    return <View />; // ✅ Prevents returning `null` which can cause errors
  }

  const root = hierarchy(storageData)
    .sum((d) => d.size > 500 * 1024 ? d.size : 500 * 1024)
    .sort((a, b) => b.value - a.value);

  const tree = treemap()
    .size([svgWidth, svgHeight])
    .tile(treemapResquarify)
    .padding(0);

  tree(root);

  const colorScale = d3.scaleOrdinal()
    .domain(root.children ? root.children.map((d) => d.data.name) : [])
    .range(["#BB86FC", "#6200EA", "#FF0266", "#FF9800", "#03DAC6", "#8BC34A", "#FFC107", "#FF5722"]);

  return (
    <View> {/* ✅ Ensures the component returns a valid View */}
      <Svg width={svgWidth} height={svgHeight}>
        {root.leaves().map((leaf, index) => (
          <G key={index}>
            <Rect
              x={leaf.x0}
              y={leaf.y0}
              width={leaf.x1 - leaf.x0}
              height={leaf.y1 - leaf.y0}
              fill={colorScale(leaf.parent ? leaf.parent.data.name : "default") || "#757575"}
              stroke="#fff"
              strokeWidth="0.3"
            />
          </G>
        ))}
      </Svg>
    </View>
  );
};

export default MediaVisualization;
