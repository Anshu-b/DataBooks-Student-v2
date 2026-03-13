import type { AggregatedTelemetryPoint } from "../analytics/aggregateTelemetry";

export function buildHistogramPlotData(
  telemetry: AggregatedTelemetryPoint[],
  key: keyof AggregatedTelemetryPoint
) {
  if (telemetry.length === 0) return [];

  const latest = telemetry[telemetry.length - 1];

  return [
    {
      bucket: String(key),
      count: Number(latest[key]),
    },
  ];
}
