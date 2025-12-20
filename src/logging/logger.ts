/**
 * InteractionLogger
 * -----------------
 * Interface for logging user interaction events.
 *
 * Implementations may send data to:
 *  - Butterfly
 *  - Firebase
 *  - REST API
 *  - Console (for dev)
 */

import type { UserInteractionEvent } from "./events";

export interface Logger {
  log(event: UserInteractionEvent): void;
}

