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
import type { ScreenMode } from "../../types/layout";
import GameHeader from "../../components/game/GameHeader";
import GameLayout from "../../components/game/GameLayout";
import { GameStateProvider } from "../../state/GameStateContext";
import { GAMES } from "../../config/games";

function AlienInvasionPage() {
  const { state } = useLocation();
  const playerName = state?.playerName ?? "Unknown";
  const game = GAMES.find((g) => g.id === "alien-invasion");

  const [screenMode, setScreenMode] = useState<ScreenMode>("single");
  const [activePanel, setActivePanel] =
    useState<"journal" | "plots">("journal");

  if (!game) return <p>Game not found.</p>;

  return (
    <GameStateProvider gameId={game.id} playerName={playerName}>
      <GameHeader
        gameName={game.name}
        playerName={playerName}
        screenMode={screenMode}
        onToggleMode={() =>
          setScreenMode((m) => (m === "single" ? "dual" : "single"))
        }
        activePanel={activePanel}
        onSelectPanel={setActivePanel}
      />

      <GameLayout screenMode={screenMode} activePanel={activePanel} />
    </GameStateProvider>
  );
}

export default AlienInvasionPage;


  