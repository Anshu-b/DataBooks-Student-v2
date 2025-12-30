/**
 * useGameState
 * ------------
 * Public hook for consuming and mutating game state.
 *
 * This hook hides Context details and provides a stable API
 * for all game-related components.
 */

import { useGameStateContext } from "../state/GameStateContext";

export function useGameState() {
  const {
    gameState,
    setJournalAnswer,
    nextRound,
    getJournalAnswersForRound,
    saveJournalRoundAnswers,
  } = useGameStateContext();

  return {
    gameState,
    setJournalAnswer,
    nextRound,
    getJournalAnswersForRound,
    saveJournalRoundAnswers,
  };
}
