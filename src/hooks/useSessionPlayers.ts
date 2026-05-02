import { useEffect, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";

export type SessionPlayer = {
  id: string;
  name?: string;
  cadet?: string;
  sector?: string;
  joinedAt?: unknown;
  lastActiveAt?: unknown;
  [key: string]: unknown;
};

export function useSessionPlayers(sessionId: string | null) {
  const [players, setPlayers] = useState<SessionPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setPlayers([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const db = getDatabase();
    const playersRef = ref(db, `sessions/${sessionId}/players`);

    const unsubscribe = onValue(
      playersRef,
      (snapshot) => {
        const value = snapshot.val();

        if (!value) {
          setPlayers([]);
          setLoading(false);
          return;
        }

        const nextPlayers = Object.entries(value).map(([id, data]) => ({
          id,
          ...(data as Omit<SessionPlayer, "id">),
        }));

        setPlayers(nextPlayers);
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
    players,
    loading,
    error,
  };
}
