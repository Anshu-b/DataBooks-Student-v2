import { ref } from "firebase/database";
import { realtimeDb } from "./firebase";

export function getSessionRef(sessionId: string) {
  return ref(realtimeDb, `sessions/${sessionId}`);
}
