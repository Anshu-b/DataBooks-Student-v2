/**
 * ScatterChart
 * ------------
 * Renders a scatter plot using @nivo/scatterplot.
 * Expects data already shaped for Nivo.
 */

import { ResponsiveScatterPlot } from "@nivo/scatterplot";

type ScatterChartProps = {
  data: {
    id: string;
    data: { x: number; y: number }[];
  }[];
  xLegend?: string;
  yLegend?: string;
};

function ScatterChart({ data, xLegend = "X", yLegend = "Y" }: ScatterChartProps) {
  return (
    <div style={{ height: 400 }}>
      <ResponsiveScatterPlot
        data={data}
        margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
        xScale={{ type: "linear"}}
        yScale={{ type: "linear",  min: 0, max: "auto"  }}
        axisBottom={{
          legend: xLegend,
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          legend: yLegend,
          legendOffset: -50,
          legendPosition: "middle",
        }}
        colors={{ scheme: "category10" }}
        nodeSize={15}
      />
    </div>
  );
}

export default ScatterChart;
