/**
 * GameLayout
 * ----------
 * Layout controller for game content.
 *
 * This component is the ONLY place that knows about
 * single-screen vs dual-screen rendering.
 *
 * Responsibilities:
 *   - Decide which panels are visible
 *   - Arrange panels spatially (side-by-side or stacked)
 *   - Observe layout-relevant prop changes for logging
 *
 * Non-responsibilities:
 *   - User intent
 *   - State ownership
 *   - Data fetching
 *   - Event handling
 *
 * Logging Policy:
 *   - Logs ONLY derived layout changes
 *   - Never logs user actions directly
 */

import { useEffect } from "react";
import type { ScreenMode } from "../../types/layout";
import { useLogger } from "../../logging/LoggingProvider";
import JournalPanel from "./JournalPanel";
import DataPlotsPanel from "./DataPlotsPanel";

type Props = {
  screenMode: ScreenMode;
  activePanel: "journal" | "plots";
};

function GameLayout({ screenMode, activePanel }: Props) {
  const logger = useLogger();

  /**
   * Log screen mode transitions (single ↔ dual).
   * This records layout state changes, not user intent.
   */
  useEffect(() => {
    logger.log({
      type: "layout.screen_mode_changed",
      payload: {
        screenMode,
      },
    });
  }, [screenMode, logger]);

  /**
   * Log active panel visibility changes.
   * Useful for reconstructing what the user saw.
   */
  useEffect(() => {
    logger.log({
      type: "layout.active_panel_changed",
      payload: {
        panel: activePanel,
      },
    });
  }, [activePanel, logger]);

  // Dual screen layout
  if (screenMode === "dual") {
    return (
      <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
        <div style={{ flex: 1, borderRight: "2px solid #eee" }}>
          <JournalPanel />
        </div>
        <div style={{ flex: 1 }}>
          <DataPlotsPanel />
        </div>
      </div>
    );
  }

  // Single screen layout
  return (
    <div style={{ height: "calc(100vh - 64px)" }}>
      {activePanel === "journal" ? (
        <JournalPanel />
      ) : (
        <DataPlotsPanel />
      )}
    </div>
  );
}

export default GameLayout;
