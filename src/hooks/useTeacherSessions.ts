import { useCallback, useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  runTransaction,
} from "firebase/database";
import { useTeacherAuth } from "./useTeacherAuth";

export interface TeacherSession {
  id: string;
  teacherId: string;
  gameId: string;
  status: "draft" | "active" | "inactive";
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

async function generateUniqueSessionId(
  db: ReturnType<typeof getDatabase>
): Promise<string> {
  const counterRef = ref(db, "sessionCounter");

  const transactionResult = await runTransaction(counterRef, (currentValue) => {
    const currentCount =
      typeof currentValue === "number" && Number.isFinite(currentValue)
        ? currentValue
        : 0;

    return currentCount + 1;
  });

  const nextCount = transactionResult.snapshot.val();

  if (typeof nextCount !== "number" || !Number.isFinite(nextCount)) {
    throw new Error("Failed to generate session ID.");
  }

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `A${nextCount}${month}${day}`;
}

function parseIsoTimestampToMs(timestamp: unknown): number | null {
  if (typeof timestamp !== "string" || !timestamp.trim()) {
    return null;
  }

  const parsedMs = Date.parse(timestamp);
  return Number.isNaN(parsedMs) ? null : parsedMs;
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

          if (!metaSnapshot.exists()) {
            return null;
          }

          const metadata = metaSnapshot.val();

          return {
            id,
            teacherId: metadata.teacherId,
            gameId: metadata.gameId,
            status: metadata.status ?? "draft",
            start: metadata.start ?? null,
            stop: metadata.stop ?? null,
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

  async function createSession(gameId: string) {
    if (!user) {
      return;
    }

    const sessionId = await generateUniqueSessionId(db);

    await set(ref(db, `sessions/${sessionId}/metadata`), {
      teacherId: user.uid,
      gameId,
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

  return {
    sessions,
    loading,
    createSession,
    activateSession,
    stopSession,
  };
}