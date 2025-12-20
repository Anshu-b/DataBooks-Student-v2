/**
 * LoggingProvider
 * ---------------
 * Supplies a single InteractionLogger instance
 * to the entire React app.
 */

import { createContext, useContext } from "react";
import type { InteractionLogger } from "./logger";

const LoggingContext = createContext<InteractionLogger | null>(null);

export function LoggingProvider({
  logger,
  children,
}: {
  logger: InteractionLogger;
  children: React.ReactNode;
}) {
  return (
    <LoggingContext.Provider value={logger}>
      {children}
    </LoggingContext.Provider>
  );
}

export function useLogger(): InteractionLogger {
  const ctx = useContext(LoggingContext);
  if (!ctx) {
    throw new Error("useLogger must be used inside LoggingProvider");
  }
  return ctx;
}
