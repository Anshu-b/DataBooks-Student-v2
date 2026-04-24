/**
 * LineChart
 * ---------
 * Thin wrapper around @nivo/line.
 * Expects data already shaped for Nivo.
 *
 * This component:
 *  - Does NOT know about plot config
 *  - Does NOT know about telemetry
 *  - Only renders what it is given
 */

import { ResponsiveLine } from "@nivo/line";

type LineChartProps = {
  data: {
    id: string;
    data: { x: number | string | Date; y: number }[];
  }[];

  xScaleType?: "linear" | "time";
  xFormat?: string;
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
  if (range <= 0) return 1;

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
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];

  for (let value = 0; value <= end + step / 2; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }

  return ticks;
}

function LineChart({ 
  data, 
  xScaleType = "linear", 
  xLegend = "X", 
  yLegend = "Y" 
}: LineChartProps) {
  const series = data.flatMap((entry) => entry.data);
  const linearXValues =
    xScaleType === "linear"
      ? series.map((point) => Number(point.x)).filter((value) => Number.isFinite(value))
      : [];
  const yValues = series.map((point) => point.y);

  return (
    <div style={{ height: 550 }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 40, right: 40, bottom: 100, left: 70 }}

        xScale={
          xScaleType === "time"
            ? { type: "time", format: "native", precision: "second" }
            : { type: "linear", min: 0, max: "auto" }
        }

        xFormat={xScaleType === "time" ? "time:%H:%M:%S" : undefined}

        yScale={{ type: "linear", min: 0, max: "auto" }}

        axisBottom={{
          format: xScaleType === "time" ? "%H:%M:%S" : undefined,
          tickValues:
            xScaleType === "linear"
              ? buildLinearTickValues(linearXValues, 6, 1)
              : undefined,
          tickRotation: -45,
          tickPadding: 10,
          tickSize: 5,
          legend: xLegend,
          legendOffset: 70,
          legendPosition: "middle",
        }}
        
        axisLeft={{ 
          tickValues: buildLinearTickValues(yValues),
          legend: yLegend, 
          legendOffset: -55,
          legendPosition: "middle"
        }}
        
        colors={{ scheme: "category10" }}
        pointSize={8}
        useMesh
        enableSlices="x"
      />
    </div>
  );
}

export default LineChart;
