/**
 * FirebaseLogger
 * --------------
 * Persists UI interaction events to Firestore.
 *
 * This logger:
 * - Is write-only
 * - Does NOT know about React
 * - Matches the research event schema exactly
 */

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Logger } from "./logger";
import type { UserInteractionEvent } from "./events";

type FirebaseLoggerOptions = {
  userId: string;
  gameId: string;
  batchTimestamp: string;
};

export class FirebaseLogger implements Logger {
  private userId: string;
  private gameId: string;
  private batchTimestamp: string;

  constructor(options: FirebaseLoggerOptions) {
    this.userId = options.userId;
    this.gameId = options.gameId;
    this.batchTimestamp = options.batchTimestamp;
  }

  log(event: UserInteractionEvent): void {
    const basePayload = {
      userId: this.userId,
      gameId: this.gameId,
      batchTimestamp: this.batchTimestamp,
  
      type: event.type,
      timestamp: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    };
  
    const eventPayload = {
      ...basePayload,
      ...(event.action && { action: event.action }),
      ...(event.details && { details: event.details }),
    };
  
    addDoc(collection(db, "ui_events"), eventPayload).catch((err) => {
      console.error("Failed to log UI event:", err);
    });
  }
  
}
