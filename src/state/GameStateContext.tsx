/**
 * GameStateContext
 * ----------------
 * React Context responsible for owning and mutating GameState.
 *
 * This is the ONLY place where game state is created and updated.
 * UI components should consume state via useGameState().
 */

import { createContext, useContext, useState } from "react";
import type { GameState, JournalAnswer } from "../types/gameState";

type GameStateContextValue = {
  gameState: GameState;
  setJournalAnswer: (round: number, answer: JournalAnswer) => void;
  nextRound: () => void;
  getJournalAnswersForRound: (round: number) => JournalAnswer[];
};

const GameStateContext = createContext<GameStateContextValue | null>(null);

type Props = {
  initialGameState: GameState;
  children: React.ReactNode;
};


export function GameStateProvider({ initialGameState, children }: Props) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);


  function setJournalAnswer(round: number, answer: JournalAnswer) {
    setGameState((prev) => ({
      ...prev,
      rounds: {
        ...prev.rounds,
        [round]: {
          ...prev.rounds[round],
          journalAnswers: {
            ...prev.rounds[round].journalAnswers,
            [answer.questionId]: answer,
          },
        },
      },
    }));
  }

  function nextRound() {
    setGameState((prev) => {
      const next = prev.currentRound + 1;
      return {
        ...prev,
        currentRound: next,
        rounds: {
          ...prev.rounds,
          [next]: { roundNumber: next, journalAnswers: {} },
        },
      };
    });
  }


  function getJournalAnswersForRound(round: number): JournalAnswer[] {
    const answersById = gameState.rounds[round]?.journalAnswers ?? {};
    return Object.values(answersById);
  }

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        setJournalAnswer,
        nextRound,
        getJournalAnswersForRound, // 👈 exposed here
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameStateContext() {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error("useGameStateContext must be used within GameStateProvider");
  }
  return ctx;
}
