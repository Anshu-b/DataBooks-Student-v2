/**
 * HistogramChart
 * --------------
 * Renders a histogram using @nivo/bar.
 */

import { ResponsiveBar } from "@nivo/bar";

type HistogramChartProps = {
  data: {
    bucket: string;
    count: number;
  }[];
  xLegend?: string;
};

function buildIntegerTickValues(values: number[]) {
  const numericValues = values.filter((value) => Number.isFinite(value));
  if (numericValues.length === 0) return undefined;

  const max = Math.max(...numericValues);
  const ticks: number[] = [];

  for (let value = 0; value <= max; value += 1) {
    ticks.push(value);
  }

  if (ticks.length === 0) {
    return [0];
  }

  if (ticks[ticks.length - 1] !== max) {
    ticks.push(max);
  }

  return ticks;
}

function HistogramChart({ data, xLegend = "X" }: HistogramChartProps) {
  const counts = data.map((entry) => entry.count);

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
        axisLeft={{
          tickValues: buildIntegerTickValues(counts),
          legend: "Count",
          legendOffset: -50,
        }}
        colors={{ scheme: "category10" }}
        valueScale={{ type: "linear", min: 0, max: "auto" }}
      />
    </div>
  );
}

export default HistogramChart;
