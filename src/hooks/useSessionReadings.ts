import { useEffect, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";

export type SessionReading = {
  id: string;
  device_id?: string;
  infection_status?: number;
  timestamp?: string;
  deviceId?: string;
  playerId?: string;
  playerName?: string;
  infectionStatus?: string;
  value?: number;
  reading?: unknown;
  [key: string]: unknown;
};

export function useSessionReadings(sessionId: string | null) {
  const [readings, setReadings] = useState<SessionReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setReadings([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const db = getDatabase();
    const readingsRef = ref(db, `sessions/${sessionId}/readings`);

    const unsubscribe = onValue(
      readingsRef,
      (snapshot) => {
        const value = snapshot.val();

        if (!value) {
          setReadings([]);
          setLoading(false);
          return;
        }

        const nextReadings = Object.entries(value).map(([id, data]) => ({
          id,
          ...(data as Omit<SessionReading, "id">),
        }));

        setReadings(nextReadings);
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
    readings,
    loading,
    error,
  };
}