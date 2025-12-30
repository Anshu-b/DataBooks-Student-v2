/**
 * GameStateContext
 * ----------------
 * React Context responsible for owning and mutating GameState.
 *
 * This is the ONLY place where game state is created and updated.
 * UI components should consume state via useGameState().
 */

import { createContext, useContext, useState, useEffect } from "react";
import type { GameState, JournalAnswer } from "../types/gameState";
import { saveJournalRound } from "../firebase/saveJournalRound";
import { loadJournalAnswers } from "../firebase/loadJournalAnswers";


type GameStateContextValue = {
  gameState: GameState;
  setJournalAnswer: (round: number, answer: JournalAnswer) => void;
  nextRound: () => void;
  getJournalAnswersForRound: (round: number) => JournalAnswer[];
  saveJournalRoundAnswers: (round: number) => Promise<void>;
};

const GameStateContext = createContext<GameStateContextValue | null>(null);

type Props = {
  initialGameState: GameState;
  children: React.ReactNode;
};


export function GameStateProvider({ initialGameState, children }: Props) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  useEffect(() => {
    async function hydrateJournalAnswers() {
      // console.log("🟡 hydrateJournalAnswers CALLED");
      const saved = await loadJournalAnswers({
        sessionId: initialGameState.sessionId,
        playerName: initialGameState.player.name,
      });

      // console.log("🟡 loadJournalAnswers returned:", saved);
  
      if (!saved) return;
  
      setGameState((prev) => {
        // console.log("🟡 merging saved answers into gameState", saved);
        const mergedRounds = { ...prev.rounds };
  
        for (const [roundStr, answersByQuestionId] of Object.entries(saved)) {
          const round = Number(roundStr);
  
          mergedRounds[round] = {
            roundNumber: round,
            journalAnswers: Object.fromEntries(
              Object.entries(answersByQuestionId as Record<string, any>).map(
                ([questionId, data]) => [
                  questionId,
                  {
                    questionId,
                    answer: data.answer,
                    updatedAt: data.updatedAt,
                  },
                ]
              )
            ),
          };
        }
  
        return {
          ...prev,
          rounds: mergedRounds,
        };
      });
    }
  
    hydrateJournalAnswers();
  }, []);
  


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

  function saveJournalRoundAnswers(round: number) {
    const answers = getJournalAnswersForRound(round);
    return saveJournalRound({
      sessionId: gameState.sessionId,
      playerName: gameState.player.name,
      round,
      answers,
    });
  }

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        setJournalAnswer,
        nextRound,
        getJournalAnswersForRound,
        saveJournalRoundAnswers,
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
