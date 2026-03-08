import { useCallback, useEffect, useState } from "react";
import { getDatabase, ref, get, set, update } from "firebase/database";
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

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function buildSessionId(gameId: string): string {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");
  const milliseconds = String(now.getUTCMilliseconds()).padStart(3, "0");

  const randomPart = Math.random().toString(36).slice(2, 7);
  const safeGameId = sanitizeSegment(gameId) || "session";

  return `${safeGameId}-${year}${month}${day}-${hours}${minutes}${seconds}${milliseconds}-${randomPart}`;
}

export function useTeacherSessions() {
  const { user } = useTeacherAuth();
  const [sessions, setSessions] = useState<TeacherSession[]>([]);
  const [loading, setLoading] = useState(true);

  const db = getDatabase();

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
          const metaSnap = await get(ref(db, `sessions/${id}/metadata`));

          if (!metaSnap.exists()) {
            return null;
          }

          const meta = metaSnap.val();

          return {
            id,
            teacherId: meta.teacherId,
            gameId: meta.gameId,
            status: meta.status ?? "draft",
            start: meta.start ?? null,
            stop: meta.stop ?? null,
          } as TeacherSession;
        })
      );

      const loadedSessions = sessionSnapshots
        .filter((session): session is TeacherSession => session !== null)
        .sort((leftSession, rightSession) => {
          const leftTime =
            leftSession.start?.timestamp ??
            leftSession.stop?.timestamp ??
            "";
          const rightTime =
            rightSession.start?.timestamp ??
            rightSession.stop?.timestamp ??
            "";

          return rightTime.localeCompare(leftTime);
        });

      setSessions(loadedSessions);
    } finally {
      setLoading(false);
    }
  }, [db, user]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  async function createSession(gameId: string) {
    if (!user) {
      return;
    }

    const sessionId = buildSessionId(gameId);

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

    await update(ref(db, `sessions/${sessionId}/metadata`), {
      status: "active",
      start: {
        action: "start",
        teacher: user.email ?? "Unknown",
        class: details.className,
        cadets: details.cadets,
        sectors: details.sectors,
        ...(details.slidesLink ? { slidesLink: details.slidesLink } : {}),
        timestamp: new Date().toISOString(),
      },
      stop: null,
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

  return {
    sessions,
    loading,
    createSession,
    activateSession,
    stopSession,
  };
}