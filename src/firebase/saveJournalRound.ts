import { ref, set } from "firebase/database";
import { realtimeDb } from "./firebase";

export function saveJournalRound({
  sessionId,
  playerName,
  round,
  answers,
}: {
  sessionId: string;
  playerName: string;
  round: number;
  answers: { questionId: string; answer: string }[];
}) {
  const roundRef = ref(
    realtimeDb,
    `sessions/${sessionId}/journalAnswers/${playerName}/${round}`
  );

  const payload: Record<string, any> = {};

  answers.forEach((a) => {
    payload[a.questionId] = {
      answer: a.answer,
      updatedAt: Date.now(),
    };
  });

  return set(roundRef, payload);
}
