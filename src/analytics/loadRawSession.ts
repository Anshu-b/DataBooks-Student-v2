/**
 * loadRawSession
 * --------------
 * Normalizes raw JSON session data into strongly typed RawReading[].
 *
 * This function is the boundary between untyped external data
 * (JSON / Firebase) and the typed analytics pipeline.
 */

import type { RawReading } from "./types";

export function loadRawSession(rawSession: any): RawReading[] {
  return Object.values(rawSession.readings).map((r: any) => ({
    device_id: r.device_id,
    infection_status: r.infection_status === 1 ? 1 : 0,
    S: normalizeSignalArray(r.S),
    T: normalizeSignalArray(r.T),
    QR: normalizeSignalArray(r.QR),
    timestamp: r.timestamp,
  }));
}

function normalizeSignalArray(value: unknown): number[] {
  const parsedValue = typeof value === "string" ? parseArrayString(value) : value;

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.map((entry) => (Number(entry) === 1 ? 1 : 0));
}

function parseArrayString(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}
