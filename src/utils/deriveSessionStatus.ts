/**
 * deriveSessionStatus
 * -------------------
 * Determines whether a session is active, paused, or inactive
 * based solely on session metadata timestamps.
 */

export type SessionStatus = "active" | "paused" | "inactive";

type SessionEvent = {
  action: "start" | "stop" | "pause" | "resume";
  timestamp: string;
};

type SessionMetadata = Partial<{
  start: SessionEvent;
  stop: SessionEvent;
  pause: SessionEvent;
  resume: SessionEvent;
}>;

export function deriveSessionStatus(
  metadata?: SessionMetadata
): SessionStatus {
  if (!metadata || !metadata.start) {
    return "inactive";
  }

  const events: SessionEvent[] = Object.values(metadata).filter(
    (e): e is SessionEvent => Boolean(e?.timestamp)
  );

  if (events.length === 0) {
    return "inactive";
  }

  const latest = events.reduce((a, b) =>
    new Date(a.timestamp) > new Date(b.timestamp) ? a : b
  );

  switch (latest.action) {
    case "start":
    case "resume":
      return "active";
    case "pause":
      return "paused";
    case "stop":
      return "inactive";
    default:
      return "inactive";
  }
}
