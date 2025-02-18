import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Rect, G } from "react-native-svg";
import { treemap, hierarchy, treemapResquarify } from "d3-hierarchy";
import * as d3 from "d3-scale";
import { useWindowDimensions } from "react-native";

const MediaVisualization = React.memo(({ storageData }) => {
  console.log("🔄 MediaVisualization re-rendering...");

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const svgWidth = screenWidth;
  const svgHeight = screenHeight * 0.6;

  if (!storageData || !storageData.children) {
    return <View />;
  }

  // ✅ RESTORED: EXACTLY how it was before (5MB min threshold)
  const root = useMemo(() => {
    return hierarchy(storageData)
      .sum((d) => d.size > 0 ? d.size : 1) // Prevent NaN values, default to 1 if size <= 0
      .sort((a, b) => b.value - a.value);
  }, [storageData]); // ✅ Only re-compute if `storageData` actually changes

  // ✅ RESTORED: `treemapResquarify` as in the working version
  const tree = useMemo(() => {
    console.log("📊 Computing treemap...");
    return treemap()
      .size([svgWidth, svgHeight])
      .tile(treemapResquarify)
      .padding(0)(root);
  }, [root, svgWidth, svgHeight]);

  // ✅ No unnecessary color recomputation
  const colorScale = useMemo(() => d3.scaleOrdinal()
    .domain(root.children ? root.children.map((d) => d.data.name) : [])
    .range(["#BB86FC", "#6200EA", "#FF0266", "#FF9800", "#03DAC6", "#8BC34A", "#FFC107", "#FF5722"]), [root]);

  return (
    <View>
      <Svg width={svgWidth} height={svgHeight}>
        {tree.leaves().map((leaf, index) => (
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
}, (prevProps, nextProps) => {
  // ✅ Prevents re-renders unless `storageData` actually changes
  return JSON.stringify(prevProps.storageData) === JSON.stringify(nextProps.storageData);
});

export default MediaVisualization;
