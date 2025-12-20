/**
 * GameState Types
 * ---------------
 * Types representing the runtime state of a game session.
 *
 * These types define WHAT data exists, not HOW it is rendered or persisted.
 * They are shared across Journal, DataPlots, Firebase, and future 
 * multiplayer logic.
 */

export type Player = {
    name: string;
  };
  
  export type JournalAnswer = {
    questionId: string;
    answer: string;
  };
  
  export type RoundState = {
    roundNumber: number;
    journalAnswers: Record<string, JournalAnswer>;
  };
  
  export type GameState = {
    gameId: string;
    player: Player;
    currentRound: number;
    rounds: Record<number, RoundState>;
  };
  