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

  const totalCadets = session.metadata.start.cadets || 22;
  const totalSectors = session.metadata.start.sectors || 6;

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
    .map((r) => ({
      ...r,
      time: new Date(r.timestamp),
    }))
    .filter((reading) => !Number.isNaN(reading.time.getTime()))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  /* -------------------- Aggregation -------------------- */

  const aggregated: AggregatedTelemetryPoint[] = [];
  const cadetStatuses = new Map<number, number>();
  const sectorStatuses = new Map<number, number>();

  sortedReadings.forEach((reading) => {
    const { time, device_id, infection_status } = reading;

    const duringMeeting = isDuringMeeting(time);
    const cumulativeMeetings = getCumulativeMeetings(time);
    const entityIndex = getDeviceIndex(device_id);

    if (entityIndex !== null) {
      if (device_id.startsWith("S") && entityIndex < totalCadets) {
        cadetStatuses.set(entityIndex, infection_status === 1 ? 1 : 0);
      }

      if (device_id.startsWith("T") && entityIndex < totalSectors) {
        sectorStatuses.set(entityIndex, infection_status === 1 ? 1 : 0);
      }
    }

    const infectedCadets = countInfected(cadetStatuses);
    const infectedSectors = countInfected(sectorStatuses);

    console.debug("[aggregateTelemetry] infected entities", {
      timestamp: time.toISOString(),
      sourceDevice: device_id,
      sourceStatus: infection_status,
      infectedStudents: getInfectedEntityLabels(cadetStatuses, "S"),
      infectedSectors: getInfectedEntityLabels(sectorStatuses, "T"),
    });

    aggregated.push({
      time,

      totalCadets,
      totalSectors,

      infectedCadets,
      healthyCadets: Math.max(0, totalCadets - infectedCadets),

      infectedSectors,
      healthySectors: Math.max(0, totalSectors - infectedSectors),

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

function getDeviceIndex(deviceId: string): number | null {
  const numericPortion = Number.parseInt(deviceId.slice(1), 10);
  if (Number.isNaN(numericPortion) || numericPortion <= 0) {
    return null;
  }

  return numericPortion - 1;
}

function countInfected(statuses: Map<number, number>): number {
  let infected = 0;

  statuses.forEach((status) => {
    if (status === 1) {
      infected += 1;
    }
  });

  return infected;
}

function getInfectedEntityLabels(
  statuses: Map<number, number>,
  prefix: "S" | "T"
): string[] {
  return Array.from(statuses.entries())
    .filter(([, status]) => status === 1)
    .map(([index]) => `${prefix}${index + 1}`)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
