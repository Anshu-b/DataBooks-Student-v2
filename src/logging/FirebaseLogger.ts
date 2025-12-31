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
  //userId: string;
  gameId: string;
  batchTimestamp: string;
};

export class FirebaseLogger implements Logger {
    //private userId: string;
    private gameId: string;
    private batchTimestamp: string;
    private initialized = false; // 👈 ADD THIS
  
    constructor(options: FirebaseLoggerOptions) {
      //this.userId = options.userId;
      this.gameId = options.gameId;
      this.batchTimestamp = options.batchTimestamp;
      this.initialized = true; // 👈 SET HERE
    }
  
    log(event: UserInteractionEvent): void {
      if (!this.initialized) return; // 👈 SAFETY
  
      const basePayload = {
        //userId: this.userId,
        userId: event.userId,
        sessionId: event.sessionId,
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
  
