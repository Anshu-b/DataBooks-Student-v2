/**
 * Journal Configuration
 * ---------------------
 * Declarative definition of all journal questions for each round.
 *
 * This file contains NO React logic and NO state.
 * It is the single source of truth for journal content.
 *
 * Revision notes:
 * - Round 1: retain orientation, add first data observation and patient zero seed
 * - Round 2: deepen plot reasoning, capture strategy and hypothesis with evidence
 * - Round 3: comparative thinking, plot choice justification, confidence + uncertainty
 * - All rounds: capture HOW students are thinking with plots, not just WHAT they see
 */

import type { JournalRound } from "../types/journal";

export const JOURNAL_ROUNDS: JournalRound[] = [
  {
    roundNumber: 1,
    questions: [
      // ── Orientation (keep brief) ──────────────────────────────────────────
      {
        id: "r1-q1",
        type: "text",
        prompt:
          "Welcome to your Mission Journal, cadet! Enter your codename to begin.",
      },
      {
        id: "r1-q2",
        type: "text",
        prompt:
          "Write down the codename of your partner cadet for this round.",
      },
      {
        id: "r1-q3",
        type: "text",
        prompt:
          "Which sector did you visit this round? (e.g. Sector A, Sector B…)",
      },

      // ── Interface exploration ─────────────────────────────────────────────
      {
        id: "r1-q4",
        type: "text",
        prompt:
          "Switch to Dual Screen mode. Describe what you see on each side of the screen. What information does each side give you?",
      },

      // ── First data observation ────────────────────────────────────────────
      {
        id: "r1-q5",
        type: "plot-required",
        prompt:
          "Open a line plot showing Infected Cadets on the y-axis and Time on the x-axis. What do you notice about how the number of infected cadets has changed so far?",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: ["Infected Cadets"],
        },
      },
      {
        id: "r1-q6",
        type: "text",
        prompt:
          "Now open a pie chart or bar chart showing sector infection status. Does any sector look different from the others? Describe what you see.",
      },

      // ── First hypothesis seed ─────────────────────────────────────────────
      {
        id: "r1-q7",
        type: "text",
        prompt:
          "One sector was already infected before the game started — that is Patient Zero. Based on the data you have seen so far, which sector do you suspect might be Patient Zero? It is okay to guess — write your best guess and explain why.",
      },
      {
        id: "r1-q8",
        type: "text",
        prompt:
          "Do you think you or your partner may have become infected this round? What makes you think that — or what makes it hard to know?",
      },
    ],
  },

  {
    roundNumber: 2,
    questions: [
      // ── Movement and strategy ─────────────────────────────────────────────
      {
        id: "r2-q1",
        type: "text",
        prompt:
          "Which sector did you visit this round? Did you choose the same sector as Round 1, or a different one? Explain your reasoning.",
      },
      {
        id: "r2-q2",
        type: "text",
        prompt:
          "Did you work with the same partner as Round 1, or a different one? Why did you make that choice?",
      },

      // ── Plot reasoning: change over time ──────────────────────────────────
      {
        id: "r2-q3",
        type: "plot-required",
        prompt:
          "Open a line plot with Time on the x-axis and Infected Cadets on the y-axis. Compare what the plot looks like now versus what it looked like after Round 1. Describe what changed.",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: ["Infected Cadets"],
        },
      },
      {
        id: "r2-q4",
        type: "text",
        prompt:
          "Is the infection spreading faster, slower, or about the same compared to Round 1? What in the plot makes you say that?",
      },

      // ── Sector-level analysis ─────────────────────────────────────────────
      {
        id: "r2-q5",
        type: "plot-required",
        prompt:
          "Now look at infected sectors over time using a line plot or bar chart — your choice. Which plot type did you pick, and why did it seem more useful for this question?",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: ["Infected Sectors"],
        },
      },
      {
        id: "r2-q6",
        type: "text",
        prompt:
          "Based on what you see in the sector data, is there any sector that seems to have been infected earlier or more consistently than others? Which one, and what makes it stand out?",
      },

      // ── Hypothesis update ─────────────────────────────────────────────────
      {
        id: "r2-q7",
        type: "text",
        prompt:
          "In Round 1 you made a guess about Patient Zero. Has the new data changed your mind? Write your updated hypothesis and explain what evidence supports it.",
      },

      // ── Strategy ─────────────────────────────────────────────────────────
      {
        id: "r2-q8",
        type: "text",
        prompt:
          "Based on the data so far, what is your plan for Round 3? Which sector will you avoid or visit, and why?",
      },
    ],
  },

  {
    roundNumber: 3,
    questions: [
      // ── Movement recap ───────────────────────────────────────────────────
      {
        id: "r3-q1",
        type: "text",
        prompt:
          "Which sector did you visit in Round 3? Did you follow the strategy you described at the end of Round 2? If you changed your plan, what made you change it?",
      },

      // ── Plot choice and justification ────────────────────────────────────
      {
        id: "r3-q2",
        type: "text",
        prompt:
          "You have had access to line plots, bar charts, and pie charts throughout the game. Which plot type did you find most useful for tracking infection spread, and which was least useful? Explain your reasoning.",
      },

      // ── Full arc analysis ────────────────────────────────────────────────
      {
        id: "r3-q3",
        type: "plot-required",
        prompt:
          "Open any plot that shows the full picture of infection across all three rounds. Describe the overall pattern — did infections grow quickly, slowly, or unevenly? What does the shape of the data tell you?",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: ["Infected Cadets", "Infected Sectors"],
        },
      },
      {
        id: "r3-q4",
        type: "text",
        prompt:
          "Look at the path you drew on your map task. Is there any overlap between the sectors you visited most and the sectors the data shows as most infected? What does that overlap — or lack of overlap — tell you?",
      },

      // ── Final patient zero hypothesis ────────────────────────────────────
      {
        id: "r3-q5",
        type: "text",
        prompt:
          "This is your final hypothesis: which sector do you believe is Patient Zero? Walk through your reasoning — what data or observations led you to this conclusion?",
      },
      {
        id: "r3-q6",
        type: "text",
        prompt:
          "How confident are you in your Patient Zero answer? What information would have made you more certain — and what made it hard to be sure?",
      },

      // ── Reflection ───────────────────────────────────────────────────────
      {
        id: "r3-q7",
        type: "text",
        prompt:
          "Thinking back across all three rounds: did using the data plots change how you moved through the ship or which sectors you chose? Give one specific example of a decision the data helped you make — or one time you wished the data had told you more.",
      },
    ],
  },
];
