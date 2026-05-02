import { useEffect, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";

export type SessionRoster = {
  playerNames: string[];
  cadets: number;
  sectors: number;
};

export function useSessionRoster(sessionId: string | null) {
  const [roster, setRoster] = useState<SessionRoster>({
    playerNames: [],
    cadets: 0,
    sectors: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setRoster({
        playerNames: [],
        cadets: 0,
        sectors: 0,
      });
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const db = getDatabase();
    const rosterRef = ref(db, `sessions/${sessionId}/metadata/start`);

    const unsubscribe = onValue(
      rosterRef,
      (snapshot) => {
        const value = snapshot.val();

        setRoster({
          playerNames: Array.isArray(value?.playerNames)
            ? value.playerNames
            : [],
          cadets: typeof value?.cadets === "number" ? value.cadets : 0,
          sectors: typeof value?.sectors === "number" ? value.sectors : 0,
        });

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
    roster,
    loading,
    error,
  };
}