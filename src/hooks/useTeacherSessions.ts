import { useCallback, useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
} from "firebase/database";
import { useTeacherAuth } from "./useTeacherAuth";

export interface TeacherSession {
  id: string;
  teacherId: string;
  gameId: string;
  status: "draft" | "active" | "inactive";
  sessionName: string;
  playerNames: string[];
  start: null | {
    action: "start";
    teacher: string;
    class: string;
    cadets: number;
    sectors: number;
    slidesLink?: string;
    timestamp: string;
    activatedAtMs: number;
  };
  stop: null | {
    action: "stop";
    timestamp: string;
  };
  activeMeeting: null | {
    id: string;
    startTime: string;
  };
  meetingCount: number;
}

interface ActivateSessionDetails {
  className: string;
  cadets: number;
  sectors: number;
  slidesLink?: string;
}

type ReadingValue = {
  timestamp?: string;
  [key: string]: unknown;
};

type PlayerValue = {
  createdAt?: string;
  hasChosen?: boolean;
  lastLoginAt?: string;
  password?: string;
  [key: string]: unknown;
};

function sanitizeSessionName(rawSessionName: string): string {
  return rawSessionName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/_+/g, "_")
    .replace(/^[-_]+|[-_]+$/g, "");
}

function isValidSessionName(sessionName: string): boolean {
  return /^[a-z0-9_-]+$/.test(sessionName);
}

function isValidFirebaseKey(key: string): boolean {
  return key.trim().length > 0 && !/[.#$/[\]]/.test(key);
}

function parseIsoTimestampToMs(timestamp: unknown): number | null {
  if (typeof timestamp !== "string" || !timestamp.trim()) {
    return null;
  }

  const parsedMs = Date.parse(timestamp);
  return Number.isNaN(parsedMs) ? null : parsedMs;
}

function buildNewPlayerValue(): PlayerValue {
  return {
    createdAt: new Date().toISOString(),
    hasChosen: false,
    lastLoginAt: "",
    password: "",
  };
}

export function useTeacherSessions() {
  const { user } = useTeacherAuth();
  const [sessions, setSessions] = useState<TeacherSession[]>([]);
  const [loading, setLoading] = useState(true);

  const db = getDatabase();

  const moveTopLevelReadingsToSession = useCallback(
    async (sessionId: string, activatedAtMs: number) => {
      const topLevelReadingsRef = ref(db, "readings");
      const sessionReadingsRef = ref(db, `sessions/${sessionId}/readings`);

      const topLevelSnapshot = await get(topLevelReadingsRef);

      if (!topLevelSnapshot.exists()) {
        return;
      }

      const topLevelValue = topLevelSnapshot.val();

      if (
        topLevelValue === null ||
        topLevelValue === "" ||
        typeof topLevelValue !== "object"
      ) {
        return;
      }

      const topLevelReadings = topLevelValue as Record<string, ReadingValue>;
      const readingsToMove: Record<string, ReadingValue> = {};
      const readingsToKeep: Record<string, ReadingValue> = {};

      for (const [readingId, readingValue] of Object.entries(topLevelReadings)) {
        const readingMs = parseIsoTimestampToMs(readingValue?.timestamp);

        if (readingMs !== null && readingMs >= activatedAtMs) {
          readingsToMove[readingId] = readingValue;
        } else {
          readingsToKeep[readingId] = readingValue;
        }
      }

      if (Object.keys(readingsToMove).length > 0) {
        const sessionSnapshot = await get(sessionReadingsRef);
        const existingSessionReadings =
          sessionSnapshot.exists() &&
          typeof sessionSnapshot.val() === "object" &&
          sessionSnapshot.val() !== null
            ? (sessionSnapshot.val() as Record<string, ReadingValue>)
            : {};

        await set(sessionReadingsRef, {
          ...existingSessionReadings,
          ...readingsToMove,
        });
      }

      if (Object.keys(readingsToKeep).length > 0) {
        await set(topLevelReadingsRef, readingsToKeep);
      } else {
        await set(topLevelReadingsRef, null);
      }
    },
    [db]
  );

  const loadSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const teacherRef = ref(db, `teachers/${user.uid}/sessionsOwned`);
      const snapshot = await get(teacherRef);

      if (!snapshot.exists()) {
        setSessions([]);
        return;
      }

      const sessionIds = Object.keys(snapshot.val() as Record<string, true>);
      const sessionSnapshots = await Promise.all(
        sessionIds.map(async (id) => {
          const metaSnapshot = await get(ref(db, `sessions/${id}/metadata`));
          const meetingsSnapshot = await get(ref(db, `sessions/${id}/meetings`));
          const playersSnapshot = await get(ref(db, `sessions/${id}/players`));

          if (!metaSnapshot.exists()) {
            return null;
          }

          const metadata = metaSnapshot.val();
          const meetings =
            meetingsSnapshot.exists() &&
            typeof meetingsSnapshot.val() === "object" &&
            meetingsSnapshot.val() !== null
              ? (meetingsSnapshot.val() as Record<
                  string,
                  { startTime?: string; endTime?: string }
                >)
              : {};

          const players =
            playersSnapshot.exists() &&
            typeof playersSnapshot.val() === "object" &&
            playersSnapshot.val() !== null
              ? (playersSnapshot.val() as Record<string, unknown>)
              : {};

          const playerNames = Object.keys(players).sort((left, right) =>
            left.localeCompare(right)
          );

          const activeMeetingEntry = Object.entries(meetings)
            .filter(([, meeting]) => meeting.startTime && !meeting.endTime)
            .sort((leftMeeting, rightMeeting) => {
              const leftMs = parseIsoTimestampToMs(leftMeeting[1].startTime) ?? 0;
              const rightMs =
                parseIsoTimestampToMs(rightMeeting[1].startTime) ?? 0;

              return rightMs - leftMs;
            })[0];

          return {
            id,
            teacherId: metadata.teacherId,
            gameId: metadata.gameId,
            status: metadata.status ?? "draft",
            sessionName: metadata.sessionName ?? id,
            playerNames,
            start: metadata.start ?? null,
            stop: metadata.stop ?? null,
            activeMeeting: activeMeetingEntry
              ? {
                  id: activeMeetingEntry[0],
                  startTime: activeMeetingEntry[1].startTime as string,
                }
              : null,
            meetingCount: Object.keys(meetings).length,
          } as TeacherSession;
        })
      );

      const loadedSessions = sessionSnapshots
        .filter((session): session is TeacherSession => session !== null)
        .sort((leftSession, rightSession) => {
          const leftMs = leftSession.start?.activatedAtMs ?? 0;
          const rightMs = rightSession.start?.activatedAtMs ?? 0;

          return rightMs - leftMs;
        });

      setSessions(loadedSessions);
    } finally {
      setLoading(false);
    }
  }, [db, user]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const activeSession = sessions.find(
        (session) => session.status === "active"
      );

      if (!activeSession?.start?.activatedAtMs) {
        return;
      }

      await moveTopLevelReadingsToSession(
        activeSession.id,
        activeSession.start.activatedAtMs
      );
    }, 5000);

    return () => clearInterval(intervalId);
  }, [sessions, moveTopLevelReadingsToSession]);

  async function createSession(gameId: string, rawSessionName: string) {
    if (!user) {
      return;
    }

    const sessionId = sanitizeSessionName(rawSessionName);

    if (!sessionId) {
      throw new Error(
        "Session name is required and can only contain letters, numbers, hyphens, and underscores."
      );
    }

    if (!isValidSessionName(sessionId)) {
      throw new Error(
        "Session name can only contain letters, numbers, hyphens, and underscores."
      );
    }

    const existingSessionSnapshot = await get(ref(db, `sessions/${sessionId}`));

    if (existingSessionSnapshot.exists()) {
      throw new Error("That session name is already taken.");
    }

    await set(ref(db, `sessions/${sessionId}/metadata`), {
      teacherId: user.uid,
      gameId,
      sessionName: sessionId,
      status: "draft",
      start: null,
      stop: null,
    });

    await set(ref(db, `teachers/${user.uid}/sessionsOwned/${sessionId}`), true);

    await loadSessions();
    return sessionId;
  }

  async function activateSession(
    sessionId: string,
    details: ActivateSessionDetails
  ) {
    if (!user) {
      return;
    }

    const activatedAtMs = Date.now();

    await update(ref(db, `sessions/${sessionId}/metadata`), {
      status: "active",
      start: {
        action: "start",
        teacher: user.email ?? "Unknown",
        class: details.className,
        cadets: details.cadets,
        sectors: details.sectors,
        ...(details.slidesLink ? { slidesLink: details.slidesLink } : {}),
        timestamp: new Date(activatedAtMs).toISOString(),
        activatedAtMs,
      },
      stop: null,
    });

    await moveTopLevelReadingsToSession(sessionId, activatedAtMs);
    await loadSessions();
  }

  async function setSessionPlayers(sessionId: string, playerNames: string[]) {
    const invalidName = playerNames.find((name) => !isValidFirebaseKey(name));

    if (invalidName) {
      throw new Error(
        `Invalid student name "${invalidName}". Names cannot contain ., #, $, /, [, or ].`
      );
    }

    const playersRef = ref(db, `sessions/${sessionId}/players`);
    const playersSnapshot = await get(playersRef);

    const existingPlayers =
      playersSnapshot.exists() &&
      typeof playersSnapshot.val() === "object" &&
      playersSnapshot.val() !== null
        ? (playersSnapshot.val() as Record<string, PlayerValue>)
        : {};

    const nextPlayers = playerNames.reduce<Record<string, PlayerValue>>(
      (players, rawName) => {
        const name = rawName.trim();

        if (isValidFirebaseKey(name)) {
          players[name] = existingPlayers[name] ?? buildNewPlayerValue();
        }

        return players;
      },
      {}
    );

    await set(
      playersRef,
      Object.keys(nextPlayers).length > 0 ? nextPlayers : null
    );

    await update(ref(db, `sessions/${sessionId}/metadata/start`), {
      cadets: Object.keys(nextPlayers).length,
    });

    await loadSessions();
  }

  async function addSessionPlayer(sessionId: string, playerName: string) {
    const trimmedName = playerName.trim();

    if (!isValidFirebaseKey(trimmedName)) {
      throw new Error(
        "Student name cannot be empty or contain ., #, $, /, [, or ]."
      );
    }

    const playerRef = ref(db, `sessions/${sessionId}/players/${trimmedName}`);
    const playerSnapshot = await get(playerRef);

    if (!playerSnapshot.exists()) {
      await set(playerRef, buildNewPlayerValue());
    }

    const playersSnapshot = await get(ref(db, `sessions/${sessionId}/players`));
    const players =
      playersSnapshot.exists() &&
      typeof playersSnapshot.val() === "object" &&
      playersSnapshot.val() !== null
        ? (playersSnapshot.val() as Record<string, unknown>)
        : {};

    await update(ref(db, `sessions/${sessionId}/metadata/start`), {
      cadets: Object.keys(players).length,
    });

    await loadSessions();
  }

  async function removeSessionPlayer(sessionId: string, playerName: string) {
    await remove(ref(db, `sessions/${sessionId}/players/${playerName}`));

    const playersSnapshot = await get(ref(db, `sessions/${sessionId}/players`));
    const players =
      playersSnapshot.exists() &&
      typeof playersSnapshot.val() === "object" &&
      playersSnapshot.val() !== null
        ? (playersSnapshot.val() as Record<string, unknown>)
        : {};

    await update(ref(db, `sessions/${sessionId}/metadata/start`), {
      cadets: Object.keys(players).length,
    });

    await loadSessions();
  }

  async function clearSessionPlayers(sessionId: string) {
    await set(ref(db, `sessions/${sessionId}/players`), null);

    await update(ref(db, `sessions/${sessionId}/metadata/start`), {
      cadets: 0,
    });

    await loadSessions();
  }

  async function stopSession(sessionId: string) {
    await update(ref(db, `sessions/${sessionId}/metadata`), {
      status: "inactive",
      stop: {
        action: "stop",
        timestamp: new Date().toISOString(),
      },
    });

    await loadSessions();
  }

  async function startMeeting(sessionId: string) {
    if (!user) {
      return;
    }

    const meetingsRef = ref(db, `sessions/${sessionId}/meetings`);
    const meetingsSnapshot = await get(meetingsRef);
    const meetings =
      meetingsSnapshot.exists() &&
      typeof meetingsSnapshot.val() === "object" &&
      meetingsSnapshot.val() !== null
        ? (meetingsSnapshot.val() as Record<
            string,
            { startTime?: string; endTime?: string }
          >)
        : {};

    const hasActiveMeeting = Object.values(meetings).some(
      (meeting) => meeting.startTime && !meeting.endTime
    );

    if (hasActiveMeeting) {
      return;
    }

    const nextMeetingNumber =
      Object.keys(meetings).reduce((maxValue, meetingId) => {
        const match = meetingId.match(/^meeting_(\d+)$/);

        if (!match) {
          return maxValue;
        }

        return Math.max(maxValue, Number(match[1]));
      }, 0) + 1;

    await set(
      ref(db, `sessions/${sessionId}/meetings/meeting_${nextMeetingNumber}`),
      {
        startTime: new Date().toISOString(),
        startedBy: user.email ?? "Unknown",
      }
    );

    await loadSessions();
  }

  async function endMeeting(sessionId: string) {
    if (!user) {
      return;
    }

    const meetingsRef = ref(db, `sessions/${sessionId}/meetings`);
    const meetingsSnapshot = await get(meetingsRef);

    if (!meetingsSnapshot.exists()) {
      return;
    }

    const meetings = meetingsSnapshot.val() as Record<
      string,
      { startTime?: string; endTime?: string }
    >;

    const activeMeetingEntry = Object.entries(meetings)
      .filter(([, meeting]) => meeting.startTime && !meeting.endTime)
      .sort((leftMeeting, rightMeeting) => {
        const leftMs = parseIsoTimestampToMs(leftMeeting[1].startTime) ?? 0;
        const rightMs = parseIsoTimestampToMs(rightMeeting[1].startTime) ?? 0;

        return rightMs - leftMs;
      })[0];

    if (!activeMeetingEntry) {
      return;
    }

    const [meetingId] = activeMeetingEntry;

    await update(ref(db, `sessions/${sessionId}/meetings/${meetingId}`), {
      endTime: new Date().toISOString(),
      endedBy: user.email ?? "Unknown",
    });

    await loadSessions();
  }

  return {
    sessions,
    loading,
    createSession,
    activateSession,
    setSessionPlayers,
    addSessionPlayer,
    removeSessionPlayer,
    clearSessionPlayers,
    stopSession,
    startMeeting,
    endMeeting,
  };
}
