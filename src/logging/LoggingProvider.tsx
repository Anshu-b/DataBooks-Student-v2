/**
 * LoggingProvider
 * ---------------
 * Supplies a logger instance to the component tree.
 * Logger identity is initialized AFTER login / session join.
 */

import { createContext, useContext, useState } from "react";
import type { Logger } from "./logger";
import { FirebaseLogger } from "./FirebaseLogger";

type LoggerInitArgs = {
  userId: string;
  gameId: string;
  batchTimestamp: string;
  sessionId: string;
};

type LoggingContextValue = {
  log: (event: any) => void;
  initializeLogger: (args: LoggerInitArgs) => void;
};

const LoggingContext = createContext<LoggingContextValue | null>(null);

export function LoggingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [logger, setLogger] = useState<Logger | null>(null);

  function initializeLogger({ userId, gameId, batchTimestamp //, sessionId
  }: LoggerInitArgs) {
    setLogger((prev) => {
      if (prev) return prev; // 👈 CRITICAL GUARD

      return new FirebaseLogger({
        userId,
        gameId,
        batchTimestamp,
      });
    });
  }


  return (
    <LoggingContext.Provider
      value={{
        log: (event) => {
          if (!logger) return; // safe no-op before init
          logger.log(event);
        },
        initializeLogger,
      }}
    >
      {children}
    </LoggingContext.Provider>
  );
}

export function useLogger() {
  const ctx = useContext(LoggingContext);
  if (!ctx) {
    throw new Error("useLogger must be used within LoggingProvider");
  }
  return ctx;
}
