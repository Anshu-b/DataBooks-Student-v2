/**
 * Journal Configuration
 * ---------------------
 * Declarative definition of all journal questions for each round.
 *
 * This file contains NO React logic and NO state.
 * It is the single source of truth for journal content.
 */

import type { JournalRound } from "../types/journal";

export const JOURNAL_ROUNDS: JournalRound[] = [
  {
    roundNumber: 1,
    questions: [
      {
        id: "r1-q1",
        type: "text",
        prompt:
          "Welcome to your Mission Journal, cadet! To get started, enter your codename.",
      },
      {
        id: "r1-q2",
        type: "text",
        prompt: "How many sectors are there on S.S. Astra?",
      },
      {
        id: "r1-q3",
        type: "text",
        prompt:
          "Look around the room, how many cadets are there in total [remember to count yourself!]",
      },
      {
        id: "r1-q4",
        type: "text",
        prompt:
          "During this round you completed a task with a partner cadet, what task did you complete as a team?",
      },
      {
        id: "r1-q5",
        type: "text",
        prompt:
          "Write down the codename of your partner cadet for this task.",
      },
      {
        id: "r1-q6",
        type: "text",
        prompt:
          "Given that you know that on this ship there is a sector that is infected, do you suspect that you or your partner cadet have become infected after this round?",
      },
      {
        id: "r1-q7",
        type: "text",
        prompt:
          'On the top right there is an option to "Go Dual Screen" or "Go Single Screen." How does the view change when you "Go Dual Screen"?',
      },
    ],
  },

  {
    roundNumber: 2,
    questions: [
      {
        id: "r2-q1",
        type: "text",
        prompt:
          "Report the letter of the sector (A, B, etc) you visited in this round.",
      },
      {
        id: "r2-q2",
        type: "text",
        prompt:
          "Write down the codename of your partner cadet for this task.",
      },
      {
        id: "r2-q3",
        type: "text",
        prompt:
          "Did you work with the same cadet as in Round 1? If so, why?",
      },
      {
        id: "r2-q4",
        type: "text",
        prompt:
          "Without changing the rules of the game, what do you suggest the cadets should do to lessen the spread?",
      },
      {
        id: "r2-q5",
        type: "plot-required",
        prompt:
          "Using a line plot with Time on the x-axis and Infected Cadets on the y-axis, would you say infections increased over time?",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: ["Infected Cadets"],
        },
      },
      {
        id: "r2-q6",
        type: "plot-required",
        prompt:
          "What makes the line plot helpful in answering the previous question?",
      },
    ],
  },

  {
    roundNumber: 3,
    questions: [
      {
        id: "r3-q1",
        type: "text",
        prompt:
          "Did you pick a new partner for this task? Do you think changing partners increases infection risk?",
      },
      {
        id: "r3-q2",
        type: "plot-required",
        prompt:
          "Using a line plot with Time vs Infected Sectors, describe your observations.",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: ["Infected Sectors"],
        },
      },
      {
        id: "r3-q3",
        type: "text",
        prompt:
          "What type of plot do you think is most useful for limiting infection spread?",
      },
    ],
  },
];
