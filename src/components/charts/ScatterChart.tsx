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
};

function ScatterChart({ data }: ScatterChartProps) {
  return (
    <div style={{ height: 400 }}>
      <ResponsiveScatterPlot
        data={data}
        margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
        xScale={{ type: "linear" }}
        yScale={{ type: "linear" }}
        axisBottom={{ legend: "X", legendOffset: 36 }}
        axisLeft={{ legend: "Y", legendOffset: -50 }}
        colors={{ scheme: "category10" }}
        nodeSize={6}
      />
    </div>
  );
}

export default ScatterChart;
