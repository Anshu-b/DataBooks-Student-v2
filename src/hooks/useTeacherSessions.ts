import { useEffect, useState } from "react";
import { getDatabase, ref, get, set, update } from "firebase/database";
import { useTeacherAuth } from "./useTeacherAuth";

export interface TeacherSession {
  id: string;
  teacherId: string;
  gameId: string;
  start: null | {
    action: "start";
    teacher: string;
    class: string;
    cadets: number;
    sectors: number;
    timestamp: string;
  };
  stop: null | {
    action: "stop";
    timestamp: string;
  };
}

export function useTeacherSessions() {
  const { user } = useTeacherAuth();
  const [sessions, setSessions] = useState<TeacherSession[]>([]);
  const [loading, setLoading] = useState(true);

  const db = getDatabase();

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  async function loadSessions() {
    if (!user) return;

    setLoading(true);

    const teacherRef = ref(db, `teachers/${user.uid}/sessionsOwned`);
    const snapshot = await get(teacherRef);

    if (!snapshot.exists()) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const sessionIds = Object.keys(snapshot.val());
    const loaded: TeacherSession[] = [];

    for (const id of sessionIds) {
      const metaSnap = await get(ref(db, `sessions/${id}/metadata`));

      if (metaSnap.exists()) {
        const meta = metaSnap.val();

        loaded.push({
          id,
          teacherId: meta.teacherId,
          gameId: meta.gameId,
          start: meta.start ?? null,
          stop: meta.stop ?? null,
        });
      }
    }

    setSessions(loaded);
    setLoading(false);
  }

  async function createSession(gameId: string) {
    if (!user) return;

    const sessionId = generateSessionId();

    await set(ref(db, `sessions/${sessionId}/metadata`), {
      start: null,
      stop: null,
      teacherId: user.uid,
      gameId,
    });

    await set(
      ref(db, `teachers/${user.uid}/sessionsOwned/${sessionId}`),
      true
    );

    await loadSessions();
    return sessionId;
  }

  async function startSession(
    sessionId: string,
    details: {
      className: string;
      cadets: number;
      sectors: number;
    }
  ) {
    if (!user) return;

    await update(ref(db, `sessions/${sessionId}/metadata`), {
      start: {
        action: "start",
        teacher: user.email ?? "Unknown",
        class: details.className,
        cadets: details.cadets,
        sectors: details.sectors,
        timestamp: new Date().toISOString(),
      },
      stop: null,
    });

    await loadSessions();
  }

  async function stopSession(sessionId: string) {
    await update(ref(db, `sessions/${sessionId}/metadata`), {
      stop: {
        action: "stop",
        timestamp: new Date().toISOString(),
      },
    });

    await loadSessions();
  }

  function getSessionState(session: TeacherSession) {
    if (session.stop) return "inactive";
    if (session.start) return "active";
    return "draft";
  }

  return {
    sessions,
    loading,
    createSession,
    startSession,
    stopSession,
    getSessionState,
  };
}

function generateSessionId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");

  return `${y}${m}${d}_${Date.now()}`;
}
