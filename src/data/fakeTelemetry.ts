/**
 * Fake Telemetry Data
 * -------------------
 * Temporary dataset used to validate plotting functionality.
 *
 * This mimics what real gameplay telemetry will look like:
 * time-series counts of cadets, sectors, and meetings.
 *
 * This file WILL be deleted or replaced once real telemetry
 * is wired in via GameState / Firebase.
 */

export type TelemetryPoint = {
    time: number;
    meetings: number;
    infectedCadets: number;
    healthyCadets: number;
    infectedSectors: number;
    healthySectors: number;
  };
  
  export const FAKE_TELEMETRY: TelemetryPoint[] = [
    { time: 1, meetings: 1, infectedCadets: 1, healthyCadets: 9, infectedSectors: 1, healthySectors: 5 },
    { time: 2, meetings: 2, infectedCadets: 2, healthyCadets: 8, infectedSectors: 1, healthySectors: 5 },
    { time: 3, meetings: 3, infectedCadets: 3, healthyCadets: 7, infectedSectors: 2, healthySectors: 4 },
    { time: 4, meetings: 4, infectedCadets: 4, healthyCadets: 6, infectedSectors: 2, healthySectors: 4 },
    { time: 5, meetings: 5, infectedCadets: 5, healthyCadets: 5, infectedSectors: 3, healthySectors: 3 },
  ];
  