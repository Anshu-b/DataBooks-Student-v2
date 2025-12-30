/**
 * PieChart
 * --------
 * Renders a pie chart using @nivo/pie.
 */

import { ResponsivePie } from "@nivo/pie";

type PieChartProps = {
  data: {
    id: string;
    label?: string;
    value: number;
  }[];
};

function PieChart({ data }: PieChartProps) {
  // Filter out entries with zero values
  const filteredData = data.filter(item => item.value > 0);

  return (
    <div style={{ height: 400 }}>
      <ResponsivePie
        data={filteredData}
        margin={{ top: 40, right: 140, bottom: 40, left: 40 }}
        innerRadius={0}
        padAngle={0.7}
        cornerRadius={3}
        colors={{ scheme: "set2" }}
        borderWidth={2}
        borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
        enableArcLabels={false}
        enableArcLinkLabels={false}
        legends={[
          {
            anchor: "right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 8,
            itemWidth: 100,
            itemHeight: 20,
            itemTextColor: "#333",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 16,
            symbolShape: "circle",
          },
        ]}
      />
    </div>
  );
}

export default PieChart;