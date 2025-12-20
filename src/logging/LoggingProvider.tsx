/**
 * LoggingProvider
 * ---------------
 * Supplies a logger instance to the component tree.
 */

import { createContext, useContext } from "react";
import type { Logger } from "./logger";

const LoggingContext = createContext<Logger | null>(null);

export function LoggingProvider({
  logger,
  children,
}: {
  logger: Logger;
  children: React.ReactNode;
}) {
  return (
    <LoggingContext.Provider value={logger}>
      {children}
    </LoggingContext.Provider>
  );
}

export function useLogger(): Logger {
  const logger = useContext(LoggingContext);
  if (!logger) {
    throw new Error("useLogger must be used within LoggingProvider");
  }
  return logger;
}
