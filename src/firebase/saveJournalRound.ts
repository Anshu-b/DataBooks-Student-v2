import { ref, set } from "firebase/database";
import { realtimeDb } from "./firebase";

export function saveJournalRound({
  sessionId,
  playerName,
  answersPath = "journalAnswers",
  round,
  answers,
}: {
  sessionId: string;
  playerName: string;
  answersPath?: "journalAnswers" | "bridgeCrewLogAnswers";
  round: number;
  answers: { questionId: string; answer: string }[];
}) {
  const roundRef = ref(
    realtimeDb,
    `sessions/${sessionId}/${answersPath}/${playerName}/${round}`
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
