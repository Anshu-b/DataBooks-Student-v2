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

/**
 * aggregateTelemetry
 * ------------------
 * Aggregates realtime ESP telemetry + meeting data into
 * plot-ready time series points.
 *
 * IMPORTANT:
 * - Metadata is the source of truth for cadet/sector counts
 * - Proximity mask layout:
 *     [ cadets | sectors | quarantine ]
 * - Meetings are interval-based (start/end)
 */

/* -------------------- Types (preserved naming) -------------------- */

export type RawReading = {
  device_id: string;
  infection_status: number;
  proximity_mask: string;
  timestamp: string;
};

export type MeetingLog = {
  startTime: string;
  endTime?: string;
};

export type SessionData = {
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
  meetings: Record<string, MeetingLog>;
};

export type AggregatedTelemetryPoint = {
  time: Date;

  /* Totals (explicit, metadata-derived) */
  totalCadets: number;
  totalSectors: number;

  infectedCadets: number;
  healthyCadets: number;

  infectedSectors: number;
  healthySectors: number;

  duringMeeting: boolean;
  cumulativeMeetings: number;
};

/* -------------------- Main Aggregator -------------------- */

export function aggregateTelemetry(
  session: SessionData
): AggregatedTelemetryPoint[] {
  if (!session?.metadata?.start) return [];

  /* -------------------- Metadata (authoritative) -------------------- */

  const totalCadets = session.metadata.start.cadets;
  const totalSectors = session.metadata.start.sectors;

  const CADET_END = totalCadets;
  const SECTOR_END = totalCadets + totalSectors;
  const QUARANTINE_INDEX = totalCadets + totalSectors;

  /* -------------------- Meetings (interval normalization) -------------------- */

  const meetingIntervals = Object.values(session.meetings || {})
    .map((meeting) => {
      const start = new Date(meeting.startTime);
      const end = meeting.endTime ? new Date(meeting.endTime) : null;

      if (Number.isNaN(start.getTime())) {
        return null;
      }

      if (end && Number.isNaN(end.getTime())) {
        return null;
      }

      return {
        start,
        end,
      };
    })
    .filter((meeting): meeting is { start: Date; end: Date | null } => meeting !== null);

  const getCumulativeMeetings = (time: Date): number =>
    meetingIntervals.filter((meeting) => meeting.start <= time).length;

  const isDuringMeeting = (time: Date): boolean =>
    meetingIntervals.some((meeting) =>
      meeting.end
        ? time >= meeting.start && time <= meeting.end
        : time >= meeting.start
    );

  /* -------------------- Readings (sorted, normalized) -------------------- */

  const sortedReadings = Object.values(session.readings || {})
    .map(r => ({
      ...r,
      time: new Date(r.timestamp),
      mask: JSON.parse(r.proximity_mask) as number[],
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  /* -------------------- Aggregation -------------------- */

  const aggregated: AggregatedTelemetryPoint[] = [];

  sortedReadings.forEach(reading => {
    const { time, device_id, infection_status, mask } = reading;

    const duringMeeting = isDuringMeeting(time);
    const cumulativeMeetings = getCumulativeMeetings(time);

    /* -------- Proximity mask slicing (NO inference) -------- */

    const cadetMask = mask.slice(0, CADET_END);
    const sectorMask = mask.slice(CADET_END, SECTOR_END);
    // const quarantine = mask[QUARANTINE_INDEX]; // intentionally unused

    /* -------- Infection aggregation -------- */

    let infectedCadets = 0;
    let infectedSectors = 0;

    // Device self-status
    if (device_id.startsWith("S") && infection_status === 1) {
      infectedCadets += 1;
    }
    if (device_id.startsWith("T") && infection_status === 1) {
      infectedSectors += 1;
    }

    // Proximity-based counts
    infectedCadets += cadetMask.reduce((sum, v) => sum + (v ? 1 : 0), 0);
    infectedSectors += sectorMask.reduce((sum, v) => sum + (v ? 1 : 0), 0);

    aggregated.push({
      time,

      totalCadets,
      totalSectors,

      infectedCadets,
      healthyCadets: totalCadets - infectedCadets,

      infectedSectors,
      healthySectors: totalSectors - infectedSectors,

      duringMeeting,
      cumulativeMeetings,
    });
  });

  if (aggregated.length > 0) {
    const latestReadingTime = aggregated[aggregated.length - 1].time;
    const latestMeetingEventTime = meetingIntervals.reduce<Date | null>((latestTime, meeting) => {
      const meetingEventTime = meeting.end ?? meeting.start;

      if (!latestTime || meetingEventTime > latestTime) {
        return meetingEventTime;
      }

      return latestTime;
    }, null);

    if (latestMeetingEventTime && latestMeetingEventTime > latestReadingTime) {
      const lastPoint = aggregated[aggregated.length - 1];

      aggregated.push({
        ...lastPoint,
        time: latestMeetingEventTime,
        duringMeeting: isDuringMeeting(latestMeetingEventTime),
        cumulativeMeetings: getCumulativeMeetings(latestMeetingEventTime),
      });
    }
  }

  return aggregated;
}
