import type { AggregatedTelemetryPoint } from "../analytics/aggregateTelemetry";

type ScatterXValue = number | Date;

type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never
}[keyof T];

type ScatterXKey = NumericKeys<AggregatedTelemetryPoint> | "time";

export function buildScatterPlotData(
  telemetry: AggregatedTelemetryPoint[],
  xKey: ScatterXKey,
  yKey: NumericKeys<AggregatedTelemetryPoint>
) {
  const points = telemetry
    .map((d) => ({
      x: d[xKey] as ScatterXValue,
      y: Number(d[yKey]),
    }))
    .filter((point, index, allPoints) => {
      if (xKey !== "time") {
        return true;
      }

      if (index === 0) {
        return true;
      }

      return point.y !== allPoints[index - 1].y;
    });

  return [
    {
      id: `${String(xKey)} vs ${String(yKey)}`,
      data: points,
    },
  ];
}
