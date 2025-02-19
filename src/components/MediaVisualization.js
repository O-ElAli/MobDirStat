import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Rect, G } from "react-native-svg";
import { treemap, hierarchy, treemapResquarify } from "d3-hierarchy";
import * as d3 from "d3-scale";
import { useWindowDimensions } from "react-native";

const MediaVisualization = React.memo(({ storageData, onSelectMedia }) => {
  console.log("🔄 MediaVisualization re-rendering...");

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const svgWidth = screenWidth;
  const svgHeight = screenHeight * 0.6;

  if (!storageData || !storageData.children) {
    console.log("⚠️ storageData is empty or has no children:", storageData);
    return <View />;
  }

  const root = useMemo(() => {
    return hierarchy(storageData)
      .sum((d) => d.size > 0 ? d.size : 1) // Prevent NaN values, default to 1 if size <= 0
      .sort((a, b) => b.value - a.value);
  }, [storageData]); 

  const tree = useMemo(() => {
    console.log("📊 Computing treemap...");
    return treemap()
      .size([svgWidth, svgHeight])
      .tile(treemapResquarify)
      .padding(0)(root);
  }, [root, svgWidth, svgHeight]);

  const colorScale = useMemo(() => d3.scaleOrdinal()
    .domain(root.children ? root.children.map((d) => d.data.name) : [])
    .range(["#BB86FC", "#6200EA", "#FF0266", "#FF9800", "#03DAC6", "#8BC34A", "#FFC107", "#FF5722"]), [root]);

  return (
    <View>
      <Svg width={svgWidth} height={svgHeight}>
        {tree.leaves().map((leaf, index) => {
          return (
            <G key={index} onPressIn={() => {
              console.log("🖱️ Clicked media item:", leaf.data);
              
              if (!leaf.data.path) {
                console.log("⚠️ No path found for this media:", leaf.data);
              }

              onSelectMedia({
                name: leaf.data.name,
                size: parseFloat((leaf.data.size / (1024 * 1024)).toFixed(2)), // Convert to MB
                percentage: storageData.size ? parseFloat(((leaf.data.size / storageData.size) * 100).toFixed(2)) : 0,
                path: leaf.data.path || null, // Ensure path exists for opening
              });
            }}>
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
          );
        })}
      </Svg>
    </View>
  );
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.storageData) === JSON.stringify(nextProps.storageData);
});

export default MediaVisualization;
