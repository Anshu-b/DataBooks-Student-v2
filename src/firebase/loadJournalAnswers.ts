// firebase/loadJournalAnswers.ts
import { ref, get } from "firebase/database";
import { realtimeDb } from "./firebase";

export async function loadJournalAnswers({
  sessionId,
  playerName,
  answersPath = "journalAnswers",
}: {
  sessionId: string;
  playerName: string;
  answersPath?: "journalAnswers" | "bridgeCrewLogAnswers";
}) {
  const answersRef = ref(
    realtimeDb,
    `sessions/${sessionId}/${answersPath}/${playerName}`
  );

  const snap = await get(answersRef);
  return snap.exists() ? snap.val() : {};
}
