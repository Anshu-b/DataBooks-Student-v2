/**
 * Analytics Types
 * ---------------
 * Canonical types for raw telemetry and aggregated metrics.
 */

export type RawReading = {
    device_id: string;
    infection_status: number; // 0 or 1
    proximity_mask: string;   // stringified array
    timestamp: string;        // ISO string
  };
  

export type AggregatedTelemetryPoint = {
    time: number;
    totalCadets: number;
    infectedCadets: number;
    healthyCadets: number;
    totalSectors: number;
    infectedSectors: number;
    healthySectors: number;
    meetingsHeld: number;
  };
  
  