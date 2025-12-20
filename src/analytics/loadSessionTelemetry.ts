/**
 * loadSessionTelemetry
 * --------------------
 * Converts a raw session JSON object into aggregated telemetry
 * suitable for analytics views.
 */

import type { RawReading } from "./types";
import { aggregateTelemetry } from "./aggregateTelemetry";

export function loadSessionTelemetry(session: {
  readings: Record<string, RawReading>;
}) {
  const readingsArray = Object.values(session.readings);
  return aggregateTelemetry(readingsArray);
}
