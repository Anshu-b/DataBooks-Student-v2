/**
 * Plot Data Helpers
 * -----------------
 * Converts raw telemetry into Nivo-compatible datasets.
 */

import { FAKE_TELEMETRY } from "../data/fakeTelemetry";

export function buildLinePlotData(xKey: string, yKey: string) {
  return [
    {
      id: yKey,
      data: FAKE_TELEMETRY.map((d) => ({
        x: d[xKey as keyof typeof d],
        y: d[yKey as keyof typeof d] as number,
      })),
    },
  ];
}

export function buildScatterPlotData(xKey: string, yKey: string) {
  return [
    {
      id: `${xKey} vs ${yKey}`,
      data: FAKE_TELEMETRY.map((d) => ({
        x: d[xKey as keyof typeof d] as number,
        y: d[yKey as keyof typeof d] as number,
      })),
    },
  ];
}

export function buildHistogramData(valueKey: string) {
  const buckets: Record<string, number> = {};

  FAKE_TELEMETRY.forEach((d) => {
    const value = d[valueKey as keyof typeof d] as number;
    const bucket = String(value);
    buckets[bucket] = (buckets[bucket] ?? 0) + 1;
  });

  return Object.entries(buckets).map(([bucket, count]) => ({
    bucket,
    count,
  }));
}
