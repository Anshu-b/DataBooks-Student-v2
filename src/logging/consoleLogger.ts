/**
 * ConsoleLogger
 * -------------
 * Development-only InteractionLogger implementation.
 * Logs all user interaction events to the console.
 */

import type { Logger } from "./logger";
import type { UserInteractionEvent } from "./events";

export class ConsoleLogger implements Logger {
  log(event: UserInteractionEvent) {
    console.log(event.type, "payload" in event ? event.payload : null);
  }
}
