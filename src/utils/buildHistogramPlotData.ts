import type { AggregatedTelemetryPoint } from "../analytics/aggregateTelemetry";

export function buildHistogramPlotData(
  telemetry: AggregatedTelemetryPoint[],
  key: keyof AggregatedTelemetryPoint
) {
  const bins: Record<number, number> = {};

  telemetry.forEach((d) => {
    const v = d[key] as number;
    bins[v] = (bins[v] || 0) + 1;
  });

  return Object.entries(bins).map(([bucket, count]) => ({
    bucket: Number(bucket),
    count,
  }));
}
