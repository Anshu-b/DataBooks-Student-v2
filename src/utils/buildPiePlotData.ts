import type { AggregatedTelemetryPoint } from "../analytics/aggregateTelemetry";

export function buildPiePlotData(
  telemetry: AggregatedTelemetryPoint[],
  population: "cadets" | "sectors"
) {
  if (telemetry.length === 0) return [];

  // Use latest snapshot
  const latest = telemetry[telemetry.length - 1];

  if (population === "cadets") {
    return [
      {
        id: "Healthy Cadets",
        label: "Healthy Cadets",
        value: latest.healthyCadets,
      },
      {
        id: "Infected Cadets",
        label: "Infected Cadets",
        value: latest.infectedCadets,
      },
    ];
  }

  // sectors
  return [
    {
      id: "Healthy Sectors",
      label: "Healthy Sectors",
      value: latest.healthySectors,
    },
    {
      id: "Infected Sectors",
      label: "Infected Sectors",
      value: latest.infectedSectors,
    },
  ];
}
