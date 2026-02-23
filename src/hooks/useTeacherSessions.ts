import { useEffect, useState } from "react";
import { getDatabase, ref, get, set, update, push } from "firebase/database";
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
          status: meta.status ?? "draft",
          start: meta.start ?? null,
          stop: meta.stop ?? null,
        });
      }
    }

    setSessions(loaded);
    setLoading(false);
  }

  /* ==============================
     CREATE (default = draft)
  ============================== */

  async function createSession(gameId: string) {
    if (!user) return;

    const sessionRef = push(ref(db, "sessions"));
    const sessionId = sessionRef.key as string;

    await set(ref(db, `sessions/${sessionId}/metadata`), {
      teacherId: user.uid,
      gameId,
      status: "draft", // 🔥 default
      start: null,
      stop: null,
    });

    await set(
      ref(db, `teachers/${user.uid}/sessionsOwned/${sessionId}`),
      true
    );

    await loadSessions();
    return sessionId;
  }

  /* ==============================
     ACTIVATE SESSION
  ============================== */

  async function activateSession(
    sessionId: string,
    details: {
      className: string;
      cadets: number;
      sectors: number;
      slidesLink?: string;
    }
  ) {
    if (!user) return;

    await update(ref(db, `sessions/${sessionId}/metadata`), {
      status: "active",
      start: {
        action: "start",
        teacher: user.email ?? "Unknown",
        class: details.className,
        cadets: details.cadets,
        sectors: details.sectors,
        ...(details.slidesLink ? { slidesLink: details.slidesLink } : {}),
        //slidesLink: details.slidesLink ?? "",
        timestamp: new Date().toISOString(),
      },
      stop: null,
    });

    await loadSessions();
  }

  /* ==============================
     STOP SESSION
  ============================== */

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