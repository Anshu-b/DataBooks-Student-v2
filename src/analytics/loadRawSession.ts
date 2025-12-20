/**
 * loadRawSession
 * --------------
 * Normalizes raw JSON session data into strongly typed RawReading[].
 *
 * This function is the boundary between untyped external data
 * (JSON / Firebase) and the typed analytics pipeline.
 */

import type { RawReading } from "./aggregateTelemetry";

export function loadRawSession(rawSession: any): RawReading[] {
  return Object.values(rawSession.readings).map((r: any) => ({
    device_id: r.device_id,
    infection_status: r.infection_status === 1 ? 1 : 0,
    proximity_mask: r.proximity_mask,
    timestamp: r.timestamp,
  }));
}
