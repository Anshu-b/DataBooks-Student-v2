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
  // ════════════════════════════════════════════════════════════════════════
  // ROUND 1 — Situate the experience
  // ════════════════════════════════════════════════════════════════════════
  {
    roundNumber: 1,
    questions: [
      // ── Who is filling this out and where did you go ──────────────────────
      {
        id: "r1-q1",
        type: "text",
        prompt:
          "Who is filling out this journal right now? Enter your name, then your partner's name.",
      },
      {
        id: "r1-q2",
        type: "text",
        prompt: "Which sector did your team visit this round?",
      },

      // ── What happened at the sector ───────────────────────────────────────
      {
        id: "r1-q3",
        type: "text",
        prompt:
          "Describe what your team did at the sector. What was the task about, and what did you figure out?",
      },

      // ── Interface orientation ─────────────────────────────────────────────
      {
        id: "r1-q4",
        type: "text",
        prompt:
          "Switch to Dual Screen mode. What do you see on each side? What kind of information does each side show you?",
      },

      // ── First guided plot observation ─────────────────────────────────────
      {
        id: "r1-q5",
        type: "plot-required",
        prompt:
          "Open a line plot with Time on the x-axis and Infected Cadets on the y-axis. What do you notice? Describe what the line looks like so far.",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: ["Infected Cadets"],
        },
      },

      // ── Pie chart: sector snapshot ────────────────────────────────────────
      {
        id: "r1-q6",
        type: "plot-required",
        prompt:
          "Now open a pie chart. What does it show about the sectors right now? Does anything stand out?",
        plotConstraints: {
          plotType: "pie",
          populationOptions: ["sectors"],
        },
      },

      // ── First Patient Zero guess ──────────────────────────────────────────
      {
        id: "r1-q7",
        type: "text",
        prompt:
          "One sector was infected before the game even started — that is Patient Zero. Looking at what the data shows so far, which sector do you think it might be? Make your best guess and explain your thinking. It is okay to be wrong.",
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  // ROUND 2 — Look closely at the spread
  // ════════════════════════════════════════════════════════════════════════
  {
    roundNumber: 2,
    questions: [
      // ── Where did you go and why ──────────────────────────────────────────
      {
        id: "r2-q1",
        type: "text",
        prompt:
          "Which sector did your team visit this round? Did you choose the same one as Round 1 or a different one? What was your reason?",
      },

      // ── Line plot: change over time ───────────────────────────────────────
      {
        id: "r2-q2",
        type: "plot-required",
        prompt:
          "Open a line plot with Time on the x-axis. Pick the y-axis variable you think will tell you the most about how the infection is spreading. Which variable did you choose, and why did it seem most useful?",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: [
            "Infected Cadets",
            "Infected Sectors",
            "Healthy Cadets",
            "Healthy Sectors",
          ],
        },
      },
      {
        id: "r2-q3",
        type: "text",
        prompt:
          "Compare what this plot looks like now versus what it looked like after Round 1. What changed? Is the infection spreading faster, slower, or about the same? Point to something in the plot that supports what you are saying.",
      },

      // ── Healthy side of the data ──────────────────────────────────────────
      {
        id: "r2-q4",
        type: "plot-required",
        prompt:
          "Now switch the y-axis to Healthy Cadets or Healthy Sectors. How does looking at the healthy side change what you notice compared to only watching the infected numbers?",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: ["Healthy Cadets", "Healthy Sectors"],
        },
      },

      // ── Scatter: looking for patterns ─────────────────────────────────────
      {
        id: "r2-q5",
        type: "plot-required",
        prompt:
          "Open a scatter plot. Try different variables on the y-axis until you find something interesting. Which combination did you end up looking at, and what does it show you?",
        plotConstraints: {
          plotType: "scatter",
          xOptions: ["Time"],
          yOptions: [
            "Infected Cadets",
            "Infected Sectors",
            "Healthy Cadets",
            "Healthy Sectors",
            "Total Cadets",
            "Total Sectors",
          ],
        },
      },

      // ── Hypothesis update ─────────────────────────────────────────────────
      {
        id: "r2-q6",
        type: "text",
        prompt:
          "In Round 1 you made a guess about Patient Zero. Has the data from Round 2 changed your mind? Write your updated guess and describe what evidence supports it.",
      },

      // ── Strategy for Round 3 ──────────────────────────────────────────────
      {
        id: "r2-q7",
        type: "text",
        prompt:
          "Based on what the data is showing, what is your plan for Round 3? Which sector will you visit or avoid, and why?",
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  // ROUND 3 — Cover remaining plots, close out
  // ════════════════════════════════════════════════════════════════════════
  {
    roundNumber: 3,
    questions: [
      // ── Where did you go and did you follow the plan ──────────────────────
      {
        id: "r3-q1",
        type: "text",
        prompt:
          "Which sector did your team visit in Round 3? Did you follow the plan you described at the end of Round 2? If you changed it, what made you change it?",
      },

      // ── Histogram: distribution across the game ───────────────────────────
      {
        id: "r3-q2",
        type: "plot-required",
        prompt:
          "Open a histogram. Choose a variable to display. What does the histogram show you that the line plot did not? Describe what you see.",
        plotConstraints: {
          plotType: "histogram",
          valueOptions: [
            "Infected Cadets",
            "Infected Sectors",
            "Healthy Cadets",
            "Healthy Sectors",
          ],
        },
      },

      // ── Full picture: open plot choice ────────────────────────────────────
      {
        id: "r3-q3",
        type: "plot-required",
        prompt:
          "Open any plot that gives you the clearest picture of what happened across all three rounds. Which plot type and variable did you pick? What does the overall pattern tell you — did the infection grow quickly, slowly, or unevenly?",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: [
            "Infected Cadets",
            "Infected Sectors",
            "Healthy Cadets",
            "Healthy Sectors",
            "Total Cadets",
            "Total Sectors",
          ],
        },
      },

      // ── Plot type comparison ──────────────────────────────────────────────
      {
        id: "r3-q4",
        type: "text",
        prompt:
          "You have used line plots, scatter plots, pie charts, and histograms across the game. Which one was most useful for figuring out what was happening with the infection? Which was least useful? Explain your reasoning.",
      },

      // ── Final Patient Zero hypothesis ─────────────────────────────────────
      {
        id: "r3-q5",
        type: "text",
        prompt:
          "Final answer: which sector do you think is Patient Zero? Walk through how you got there. Which plots or observations led you to this conclusion?",
      },
      {
        id: "r3-q6",
        type: "text",
        prompt:
          "How confident are you in that answer? What information would have made you more certain — and what made it hardest to know for sure?",
      },

      // ── Closing reflection ────────────────────────────────────────────────
      {
        id: "r3-q7",
        type: "text",
        prompt:
          "Looking back across all three rounds: did the data plots actually change any decision you made — which sector you picked, whether you switched partners, how you moved through the ship? Give one specific example of a decision the data helped you make, or a moment you wished it had told you more.",
      },
    ],
  },
];
