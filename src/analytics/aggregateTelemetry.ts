/**
 * aggregateTelemetry
 * ------------------
 * Converts raw per-device telemetry readings into time-bucketed,
 * session-level aggregates suitable for analysis and plotting.
 *
 * This function is intentionally PURE and DETERMINISTIC:
 *  - No UI assumptions
 *  - No plotting logic
 *  - No Firebase dependencies
 *
 * It answers questions like:
 *  - How many cadets were infected at time t?
 *  - How many sectors were infected at time t?
 *  - How many meetings occurred in a time window?
 */

export type AggregatedTelemetryPoint = {
  time: number;

  // Cadet-level state
  totalCadets: number;
  infectedCadets: number;
  healthyCadets: number;

  // Sector-level state
  totalSectors: number;
  infectedSectors: number;
  healthySectors: number;

  // Interaction metric
  meetingsHeld: number;
};

type RawReading = {
  device_id: string;
  infection_status: 0 | 1;
  proximity_mask: string; // JSON-encoded array
  timestamp: string;      // ISO timestamp
};

export function aggregateTelemetry(
  readings: RawReading[],
  bucketSizeSeconds = 60
): AggregatedTelemetryPoint[] {
  /**
   * STEP 1: Group readings into time buckets
   * ---------------------------------------
   * Each bucket represents a fixed window of time (e.g. 60 seconds).
   */
  const buckets: Record<number, RawReading[]> = {};

  for (const reading of readings) {
    const bucket = Math.floor(
      new Date(reading.timestamp).getTime() / (bucketSizeSeconds * 1000)
    );

    if (!buckets[bucket]) {
      buckets[bucket] = [];
    }

    buckets[bucket].push(reading);
  }

  /**
   * STEP 2: Aggregate each bucket independently
   */
  const aggregated: AggregatedTelemetryPoint[] = [];

  const sortedBuckets = Object.keys(buckets)
    .map(Number)
    .sort((a, b) => a - b);

  sortedBuckets.forEach((bucketKey, index) => {
    const bucketReadings = buckets[bucketKey];

    /**
     * Track latest infection state per cadet
     * Map<device_id, infection_status>
     */
    const cadetState = new Map<string, 0 | 1>();

    /**
     * Track which sectors are infected in this bucket
     * A sector is infected if at least one infected cadet
     * was present in that sector during this time window.
     */
    const infectedSectors = new Set<number>();

    let meetingsHeld = 0;

    for (const r of bucketReadings) {
      cadetState.set(r.device_id, r.infection_status);

      const mask: number[] = JSON.parse(r.proximity_mask);

      mask.forEach((present, sectorIndex) => {
        if (present === 1) {
          meetingsHeld += 1;

          if (r.infection_status === 1) {
            infectedSectors.add(sectorIndex);
          }
        }
      });
    }

    const totalCadets = cadetState.size;
    const infectedCadets = [...cadetState.values()].filter(v => v === 1).length;

    const totalSectors =
      bucketReadings.length > 0
        ? JSON.parse(bucketReadings[0].proximity_mask).length
        : 0;

    aggregated.push({
      time: index,

      totalCadets,
      infectedCadets,
      healthyCadets: totalCadets - infectedCadets,

      totalSectors,
      infectedSectors: infectedSectors.size,
      healthySectors: totalSectors - infectedSectors.size,

      meetingsHeld,
    });
  });

  return aggregated;
}
