import { useEffect, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";

export type SessionMeeting = {
  id: string;
  startTime?: string;
  endTime?: string;
  startedBy?: string;
  endedBy?: string;
  [key: string]: unknown;
};

export function useSessionMeetings(sessionId: string | null) {
  const [meetings, setMeetings] = useState<SessionMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setMeetings([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const db = getDatabase();
    const meetingsRef = ref(db, `sessions/${sessionId}/meetings`);

    const unsubscribe = onValue(
      meetingsRef,
      (snapshot) => {
        const value = snapshot.val();

        if (!value) {
          setMeetings([]);
          setLoading(false);
          return;
        }

        const nextMeetings = Object.entries(value).map(([id, data]) => ({
          id,
          ...(data as Omit<SessionMeeting, "id">),
        }));

        setMeetings(nextMeetings);
        setLoading(false);
      },
      (firebaseError) => {
        setError(firebaseError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  return {
    meetings,
    loading,
    error,
  };
}