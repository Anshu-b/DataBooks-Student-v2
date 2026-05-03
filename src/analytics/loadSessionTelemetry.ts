/**
 * loadSessionTelemetry
 * --------------------
 * Converts a raw session JSON object into aggregated telemetry
 * suitable for analytics views.
 */

import type { RawReading } from "./types";
import { aggregateTelemetry, type MeetingLog } from "./aggregateTelemetry";

export function loadSessionTelemetry(session: {
  metadata: {
    start: {
      timestamp: string;
      cadets: number;
      sectors: number;
    };
    stop?: {
      timestamp: string;
    };
  };
  readings: Record<string, RawReading>;
  meetings?: Record<string, MeetingLog>;
}) {
  return aggregateTelemetry({
    ...session,
    meetings: session.meetings ?? {},
  });
}
