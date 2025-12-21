/**
 * AlienInvasionPage
 * -----------------
 * Top-level page for the Alien Invasion game.
 *
 * Responsibilities:
 *   - Own game-level UI state (screen mode, active panel)
 *   - Coordinate layout via GameLayout
 *   - Coordinate navigation and header behavior
 *
 * Non-responsibilities:
 *   - Rendering journal questions
 *   - Rendering plots
 *   - Game logic or telemetry
 *
 * This file acts as the orchestration layer for the game UI.
 */

import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import type { ScreenMode } from "../../types/layout";
import GameHeader from "../../components/game/GameHeader";
import GameLayout from "../../components/game/GameLayout";
import { GameStateProvider } from "../../state/GameStateContext";
import { GAMES } from "../../config/games";
import { useLogger } from "../../logging/LoggingProvider";
import { createBatchTimestamp } from "../../logging/createBatchTimestamp";


function AlienInvasionPage() {
  const { state } = useLocation();
  const playerName = state?.playerName ?? "Unknown";
  const game = GAMES.find((g) => g.id === "alien-invasion");
  const logger = useLogger();

  const [screenMode, setScreenMode] = useState<ScreenMode>("single");
  const [activePanel, setActivePanel] =
    useState<"journal" | "plots">("journal");

    if (!game) return <p>Game not found.</p>;

    useEffect(() => {
      logger.initializeLogger({
        userId: playerName,
        gameId: game.id,
        batchTimestamp: createBatchTimestamp(),
      });
    }, [playerName, game.id]);
    

  function handleSelectPanel(panel: "journal" | "plots") {
    if (activePanel !== panel) {
      logger.log({
        type: "layout.active_panel_changed",
        action: `${activePanel}_to_${panel}`,
        details: {
          from: activePanel,
          to: panel,
        },
      });
    }
    setActivePanel(panel);
  }

  function handleToggleMode() {
    const next = screenMode === "single" ? "dual" : "single";

    logger.log({
      type: "layout.screen_mode_changed",
      action: screenMode === "single" ? "single_to_dual" : "dual_to_single",
      details: {
        from: screenMode,
        to: next,
      },
    });

    setScreenMode(next);
  }

  return (
    <GameStateProvider gameId={game.id} playerName={playerName}>
      <GameHeader
        gameName={game.name}
        playerName={playerName}
        screenMode={screenMode}
        onToggleMode={handleToggleMode}
        activePanel={activePanel}
        onSelectPanel={handleSelectPanel}
      />

      <GameLayout screenMode={screenMode} activePanel={activePanel} />
    </GameStateProvider>
  );
}

export default AlienInvasionPage;