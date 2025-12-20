/**
 * ConsoleLogger
 * -------------
 * Development-only InteractionLogger implementation.
 * Logs all user interaction events to the console.
 */

import type { InteractionLogger } from "./logger";
import type { UserInteractionEvent } from "./events";

export class ConsoleLogger implements InteractionLogger {
  log(event: UserInteractionEvent) {
    console.log("[InteractionEvent]", event.type, event.payload);
  }
}
