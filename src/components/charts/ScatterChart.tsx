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
    data: { x: number | Date; y: number }[];
  }[];
  xScaleType?: "linear" | "time";
  xTimeDomain?: {
    min: Date;
    max: Date;
  };
  xLegend?: string;
  yLegend?: string;
};

const NICE_TICK_STEPS = [
  0.1, 0.2, 0.25, 0.5,
  1, 2, 2.5, 5,
  10, 20, 25, 50,
  100,
];

function getLinearValues(values: number[]) {
  return values.filter((value) => Number.isFinite(value));
}

function getNiceStep(range: number, targetTickCount = 6) {
  if (range <= 0) return 0.5;

  const roughStep = range / targetTickCount;
  const directMatch = NICE_TICK_STEPS.find((step) => step >= roughStep);
  if (directMatch) return directMatch;

  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  return Math.ceil(roughStep / magnitude) * magnitude;
}

function buildLinearTickValues(
  values: number[],
  targetTickCount = 6,
  fixedStep?: number
) {
  const numericValues = getLinearValues(values);
  if (numericValues.length === 0) return undefined;

  const max = Math.max(...numericValues);

  if (max === 0) {
    return [0];
  }

  const step = fixedStep ?? getNiceStep(max, targetTickCount);
  const start = 0;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];

  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }

  return ticks;
}

function ScatterChart({
  data,
  xScaleType = "linear",
  xTimeDomain,
  xLegend = "X",
  yLegend = "Y",
}: ScatterChartProps) {
  const series = data.flatMap((entry) => entry.data);
  const linearXValues =
    xScaleType === "linear"
      ? series.map((point) => Number(point.x)).filter((value) => Number.isFinite(value))
      : [];
  const yValues = series.map((point) => point.y);

  return (
    <div style={{ height: 400 }}>
      <ResponsiveScatterPlot
        data={data}
        margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
        xScale={
          xScaleType === "time"
            ? {
                type: "time",
                format: "native",
                precision: "second",
                min: xTimeDomain?.min ?? "auto",
                max: xTimeDomain?.max ?? "auto",
              }
            : { type: "linear", min: 0, max: "auto" }
        }
        yScale={{ type: "linear", min: 0, max: "auto" }}
        axisBottom={{
          format: xScaleType === "time" ? "%H:%M:%S" : undefined,
          tickValues:
            xScaleType === "linear"
              ? buildLinearTickValues(linearXValues, 6, 1)
              : undefined,
          tickRotation: xScaleType === "time" ? -45 : 0,
          tickPadding: 8,
          tickSize: 5,
          legend: xLegend,
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickValues: buildLinearTickValues(yValues),
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
