import { useEffect, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";
import type { ParticipantType } from "../types/gameState";
import type { SessionPlayer } from "./useSessionPlayers";

export type SessionParticipant = SessionPlayer & {
  type: ParticipantType;
};

function mapParticipants(
  value: unknown,
  type: ParticipantType
): SessionParticipant[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value as Record<string, unknown>).map(([id, data]) => ({
    id,
    ...((data ?? {}) as Omit<SessionParticipant, "id" | "type">),
    type,
  }));
}

export function useSessionParticipants(sessionId: string | null) {
  const [players, setPlayers] = useState<SessionParticipant[]>([]);
  const [nonPlayers, setNonPlayers] = useState<SessionParticipant[]>([]);
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [nonPlayersLoaded, setNonPlayersLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setPlayers([]);
      setNonPlayers([]);
      setPlayersLoaded(false);
      setNonPlayersLoaded(false);
      setError(null);
      return;
    }

    setPlayersLoaded(false);
    setNonPlayersLoaded(false);
    setError(null);

    const db = getDatabase();
    const playersRef = ref(db, `sessions/${sessionId}/players`);
    const nonPlayersRef = ref(db, `sessions/${sessionId}/nonPlayers`);

    const unsubscribePlayers = onValue(
      playersRef,
      (snapshot) => {
        setPlayers(mapParticipants(snapshot.val(), "player"));
        setPlayersLoaded(true);
      },
      (firebaseError) => {
        setError(firebaseError);
        setPlayersLoaded(true);
      }
    );

    const unsubscribeNonPlayers = onValue(
      nonPlayersRef,
      (snapshot) => {
        setNonPlayers(mapParticipants(snapshot.val(), "nonPlayer"));
        setNonPlayersLoaded(true);
      },
      (firebaseError) => {
        setError(firebaseError);
        setNonPlayersLoaded(true);
      }
    );

    return () => {
      unsubscribePlayers();
      unsubscribeNonPlayers();
    };
  }, [sessionId]);

  const participants = [...players, ...nonPlayers].sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === "player" ? -1 : 1;
    }

    return left.id.localeCompare(right.id);
  });

  return {
    participants,
    players,
    nonPlayers,
    loading: Boolean(sessionId) && (!playersLoaded || !nonPlayersLoaded),
    error,
  };
}
