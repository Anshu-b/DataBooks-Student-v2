/**
 * buildLinePlotData
 * -----------------
 * Converts aggregated telemetry into Nivo line format.
 */

import type { AggregatedTelemetryPoint } from "../analytics/aggregateTelemetry";

type LineXValue = string | number | Date;

type NonBooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? never : K
}[keyof T];


export function buildLinePlotData(
  telemetry: AggregatedTelemetryPoint[],
  xKey: NonBooleanKeys<AggregatedTelemetryPoint>,
  yKey: keyof AggregatedTelemetryPoint
): {
  id: string;
  data: { x: LineXValue; y: number }[];
}[] {
  return [
    {
      id: `${String(yKey)} vs ${String(xKey)}`,
      data: telemetry.map((d) => ({
        x: d[xKey] as LineXValue,
        y: Number(d[yKey]),
      })),
    },
  ];
}
