/**
 * Bridge Crew Log Configuration
 * -----------------------------
 * Question set for non-player participants during gameplay.
 *
 * Bridge crew members use the same round-log UI as cadets, but their prompts
 * focus on observing, coordinating, and interpreting the class-wide mission.
 */

import type { JournalRound } from "../types/journal";

export const BRIDGE_CREW_LOG_ROUNDS: JournalRound[] = [
  {
    roundNumber: 1,
    questions: [
      // ── Who is filling this out ───────────────────────────────────────────
      {
        id: "bc-r1-q1",
        type: "text",
        prompt:
          "Who is filling out this log right now? Enter your name, then your bridge crew partner's name.",
      },

      // ── Role orientation ──────────────────────────────────────────────────
      {
        id: "bc-r1-q2",
        type: "text",
        prompt:
          "You are not moving through the ship — you are watching the data feed from the bridge. In your own words, what is your job right now while the task force cadets are out in the sectors?",
      },

      // ── Interface orientation ─────────────────────────────────────────────
      {
        id: "bc-r1-q3",
        type: "text",
        prompt:
          "Switch to Dual Screen mode. What do you see on each side? What kind of information does each side show you?",
      },

      // ── First guided plot observation ─────────────────────────────────────
      {
        id: "bc-r1-q4",
        type: "plot-required",
        prompt:
          "Open a line plot with Time on the x-axis and Infected Cadets on the y-axis. Watch it during the round. What do you notice? Describe what the line looks like so far.",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: ["Infected Cadets"],
        },
      },

      // ── Pie chart: sector snapshot ────────────────────────────────────────
      {
        id: "bc-r1-q5",
        type: "plot-required",
        prompt:
          "Now open a pie chart. What does it show about the sectors right now? Does any sector look different from the others?",
        plotConstraints: {
          plotType: "pie",
          xOptions: ["Time"],
          yOptions: ["Infected Sectors", "Healthy Sectors"],
        },
      },

      // ── Sector status snapshot ────────────────────────────────────────────
      {
        id: "bc-r1-q6",
        type: "text",
        prompt:
          "Look at the sector data right now. List any sectors that already show signs of infection, and describe what you see for each one.",
      },

      // ── First Patient Zero hypothesis ─────────────────────────────────────
      {
        id: "bc-r1-q7",
        type: "text",
        prompt:
          "One sector was infected before the game even started — that is Patient Zero. Based on what the data is showing so far, which sector do you suspect? Make your best guess and explain what in the data made you think that. It is okay to be wrong.",
      },

      // ── Confidence check ──────────────────────────────────────────────────
      {
        id: "bc-r1-q8",
        type: "text",
        prompt: "How confident are you in that guess right now?",
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  // ROUND 2 — Look closely at the spread
  // ════════════════════════════════════════════════════════════════════════
  {
    roundNumber: 2,
    questions: [
      // ── Change since Round 1 ──────────────────────────────────────────────
      {
        id: "bc-r2-q1",
        type: "text",
        prompt:
          "What has changed since the end of Round 1? Describe anything new you notice in the data without opening a plot yet.",
      },

      // ── Line plot: change over time ───────────────────────────────────────
      {
        id: "bc-r2-q2",
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
        id: "bc-r2-q3",
        type: "text",
        prompt:
          "Compare this plot to what it looked like after Round 1. What changed? Is the infection spreading faster, slower, or about the same? Point to something specific in the plot that supports what you are saying.",
      },

      // ── Healthy side of the data ──────────────────────────────────────────
      {
        id: "bc-r2-q4",
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
        id: "bc-r2-q5",
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

      // ── Anomaly: which sector stands out ─────────────────────────────────
      {
        id: "bc-r2-q6",
        type: "text",
        prompt:
          "Is there any sector that looks like it has been infected earlier or more heavily than the others? Which one, and what makes it stand out in the data?",
      },

      // ── Hypothesis update ─────────────────────────────────────────────────
      {
        id: "bc-r2-q7",
        type: "text",
        prompt:
          "In Round 1 you made a guess about Patient Zero. Has the new data changed your mind? Write your updated hypothesis and describe what evidence supports it.",
      },

      // ── Confidence check ──────────────────────────────────────────────────
      {
        id: "bc-r2-q8",
        type: "text",
        prompt: "How confident are you in that updated guess?",
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  // ROUND 3 — Cover remaining plots, close out
  // ════════════════════════════════════════════════════════════════════════
  {
    roundNumber: 3,
    questions: [
      // ── What changed in Round 3 ───────────────────────────────────────────
      {
        id: "bc-r3-q1",
        type: "text",
        prompt:
          "What is the first thing you noticed changing in the data at the start of Round 3? Describe it before opening any plot.",
      },

      // ── Histogram ────────────────────────────────────────────────────────
      {
        id: "bc-r3-q2",
        type: "plot-required",
        prompt:
          "Open a histogram. Choose any variable to display. What does the histogram show you that the line plot did not? Describe what you see.",
        plotConstraints: {
          plotType: "histogram",
          xOptions: ["Time"],
          yOptions: [
            "Infected Cadets",
            "Infected Sectors",
            "Healthy Cadets",
            "Healthy Sectors",
          ],
        },
      },

      // ── Full arc: open plot choice ────────────────────────────────────────
      {
        id: "bc-r3-q3",
        type: "plot-required",
        prompt:
          "Open any plot that gives you the clearest picture of what happened across all three rounds. Which plot type and variable did you choose? What does the overall pattern tell you — did the infection grow quickly, slowly, or unevenly?",
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
        id: "bc-r3-q4",
        type: "text",
        prompt:
          "You have used line plots, scatter plots, pie charts, and histograms across the game. Which one was most useful for figuring out what was happening with the infection? Which was least useful? Explain your reasoning.",
      },

      // ── Final Patient Zero hypothesis ─────────────────────────────────────
      {
        id: "bc-r3-q5",
        type: "text",
        prompt:
          "Final answer: which sector do you think is Patient Zero? Walk through how you got there. Which plots or observations led you to this conclusion?",
      },
      {
        id: "bc-r3-q6",
        type: "text",
        prompt: "How confident are you in your final answer?",
      },
      {
        id: "bc-r3-q7",
        type: "text",
        prompt:
          "What information would have made you more certain — and what made it hardest to know for sure?",
      },

      // ── Reflection: watching vs playing ──────────────────────────────────
      {
        id: "bc-r3-q8",
        type: "text",
        prompt:
          "You watched the game from the bridge while the task force played it on the ground. What was it like learning from the data feed compared to what you imagine it would be like to actually move through the sectors? What did watching give you that you think the task force might have missed — and what do you think they understood that you could not?",
      },
    ],
  },
];
