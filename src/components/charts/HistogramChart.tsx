/**
 * HistogramChart
 * --------------
 * Renders a histogram using @nivo/bar.
 */

import { ResponsiveBar } from "@nivo/bar";

type HistogramChartProps = {
  data: {
    bucket: number;
    count: number;
  }[];
  xLegend?: string;
};

function HistogramChart({ data, xLegend = "X" }: HistogramChartProps) {
  return (
    <div style={{ height: 400 }}>
      <ResponsiveBar
        data={data}
        keys={["count"]}
        indexBy="bucket"
        margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
        axisBottom={{
          legend: xLegend,
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{ legend: "Frequency", legendOffset: -50 }}
        colors={{ scheme: "category10" }}
        valueScale={{ type: "linear", min: 0 }}
      />
    </div>
  );
}

export default HistogramChart;
