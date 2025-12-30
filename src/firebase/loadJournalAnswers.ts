// firebase/loadJournalAnswers.ts
import { ref, get } from "firebase/database";
import { realtimeDb } from "./firebase";

export async function loadJournalAnswers({
  sessionId,
  playerName,
}: {
  sessionId: string;
  playerName: string;
}) {
  const answersRef = ref(
    realtimeDb,
    `sessions/${sessionId}/journalAnswers/${playerName}`
  );

  const snap = await get(answersRef);
  return snap.exists() ? snap.val() : {};
}
