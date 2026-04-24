import { useEffect, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";

export type SessionJournalAnswer = {
  id: string;
  playerName?: string;
  cadet?: string;
  sector?: string;
  round?: number;
  answer?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  [key: string]: unknown;
};

export function useSessionJournalAnswers(sessionId: string | null) {
  const [answers, setAnswers] = useState<SessionJournalAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setAnswers([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const db = getDatabase();
    const answersRef = ref(db, `sessions/${sessionId}/journalAnswers`);

    const unsubscribe = onValue(
      answersRef,
      (snapshot) => {
        const value = snapshot.val();

        if (!value) {
          setAnswers([]);
          setLoading(false);
          return;
        }

        const nextAnswers = Object.entries(value).map(([id, data]) => ({
          id,
          ...(data as Omit<SessionJournalAnswer, "id">),
        }));

        setAnswers(nextAnswers);
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
    answers,
    loading,
    error,
  };
}