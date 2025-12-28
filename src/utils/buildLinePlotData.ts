/**
 * buildLinePlotData
 * -----------------
 * Converts aggregated telemetry into Nivo line format.
 */

import type { AggregatedTelemetryPoint } from "../analytics/aggregateTelemetry";

// export function buildLinePlotData(
//   telemetry: AggregatedTelemetryPoint[],
//   xKey: keyof AggregatedTelemetryPoint,
//   yKey: keyof AggregatedTelemetryPoint
// ) {
//   return [
//     {
//       id: `${String(yKey)} vs ${String(xKey)}`,
//       data: telemetry.map((d) => ({
//         x: d[xKey],
//         y: d[yKey] as number,
//       })),
//     },
//   ];
// }

export function buildLinePlotData(
  telemetry: AggregatedTelemetryPoint[],
  xKey: keyof AggregatedTelemetryPoint,
  yKey: keyof AggregatedTelemetryPoint
) {
  return [
    {
      id: `${String(yKey)} vs ${String(xKey)}`,
      data: telemetry.map((d) => {
        let xValue = d[xKey];
        
        // Ensure timestamp is a Date object for Nivo
        if (xKey === "timestamp" && xValue instanceof Date) {
          xValue = xValue;
        }
        
        return {
          x: xValue,
          y: d[yKey] as number,
        };
      }),
    },
  ];
}