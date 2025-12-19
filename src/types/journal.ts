/**
 * Journal Types
 * -------------
 * Typed representation of journal questions used during gameplay.
 *
 * Questions are defined as configuration and rendered dynamically
 * by the JournalPanel.
 */

export type JournalQuestionType =
  | "text"
  | "plot-required";

export type JournalQuestion = {
  id: string;
  prompt: string;
  type: JournalQuestionType;

  /**
   * Optional metadata used for plot-driven questions.
   * This allows the UI to enforce constraints without hardcoding.
   */
  plotConstraints?: {
    plotType?: "line";
    xOptions?: string[];
    yOptions?: string[];
  };
};

export type JournalRound = {
  roundNumber: number;
  questions: JournalQuestion[];
};
