import type { AggregatedTelemetryPoint } from "../analytics/aggregateTelemetry";

export function buildScatterPlotData(
  telemetry: AggregatedTelemetryPoint[],
  xKey: keyof AggregatedTelemetryPoint,
  yKey: keyof AggregatedTelemetryPoint
) {
  return [
    {
      id: `${String(xKey)} vs ${String(yKey)}`,
      data: telemetry.map((d) => ({
        x: d[xKey] as number,
        y: d[yKey] as number,
      })),
    },
  ];
}
