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
};

function HistogramChart({ data }: HistogramChartProps) {
  return (
    <div style={{ height: 400 }}>
      <ResponsiveBar
        data={data}
        keys={["count"]}
        indexBy="bucket"
        margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
        axisBottom={{ legend: "Value", legendOffset: 36 }}
        axisLeft={{ legend: "Frequency", legendOffset: -50 }}
        colors={{ scheme: "category10" }}
      />
    </div>
  );
}

export default HistogramChart;
