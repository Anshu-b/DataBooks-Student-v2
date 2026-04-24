import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export type SessionActivityLogEvent = {
  id: string;
  sessionId?: string;
  eventType?: string;
  actorId?: string;
  actorName?: string;
  page?: string;
  action?: string;
  timestamp?: unknown;
  [key: string]: unknown;
};

export function useSessionActivityLog(sessionId: string | null) {
  const [events, setEvents] = useState<SessionActivityLogEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setEvents([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const eventsQuery = query(
      collection(db, "ui_events"),
      where("sessionId", "==", sessionId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const nextEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvents(nextEvents);
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
    events,
    loading,
    error,
  };
}