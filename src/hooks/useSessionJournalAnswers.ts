import { useEffect, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";

export type SessionJournalAnswerValue = {
  answer?: string;
  updatedAt?: number;
  createdAt?: number;
  [key: string]: unknown;
};

export type SessionJournalAnswersMap = Record<
  string,
  Record<string, Record<string, SessionJournalAnswerValue>>
>;

export type SessionJournalAnswer = {
  id: string;
  playerName: string;
  round: string;
  questionId: string;
  answer?: string;
  updatedAt?: number;
  createdAt?: number;
  [key: string]: unknown;
};

export function useSessionJournalAnswers(sessionId: string | null) {
  const [answersMap, setAnswersMap] = useState<SessionJournalAnswersMap>({});
  const [answers, setAnswers] = useState<SessionJournalAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setAnswersMap({});
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

        if (!value || typeof value !== "object") {
          setAnswersMap({});
          setAnswers([]);
          setLoading(false);
          return;
        }

        const nextAnswersMap = value as SessionJournalAnswersMap;
        const nextAnswers: SessionJournalAnswer[] = [];

        Object.entries(nextAnswersMap).forEach(([playerName, rounds]) => {
          Object.entries(rounds ?? {}).forEach(([round, questions]) => {
            Object.entries(questions ?? {}).forEach(([questionId, data]) => {
              nextAnswers.push({
                id: `${playerName}-${round}-${questionId}`,
                playerName,
                round,
                questionId,
                ...data,
              });
            });
          });
        });

        setAnswersMap(nextAnswersMap);
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
    answersMap,
    answers,
    loading,
    error,
  };
}