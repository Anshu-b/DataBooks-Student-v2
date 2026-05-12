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
      {
        id: "bc-r1-q1",
        type: "text",
        prompt:
          "Welcome to the Bridge Crew Log. Enter your bridge crew codename to begin.",
      },
      {
        id: "bc-r1-q2",
        type: "text",
        prompt:
          "What part of the mission are you monitoring today? Describe your role on the bridge crew.",
      },
      {
        id: "bc-r1-q3",
        type: "text",
        prompt:
          "After Round 1, what do you notice about where cadets moved or gathered? Describe any pattern you observed.",
      },
      {
        id: "bc-r1-q4",
        type: "text",
        prompt:
          "Open a plot showing infected cadets or infected sectors. What does the data suggest about the early spread of infection?",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: ["Infected Cadets", "Infected Sectors"],
        },
      },
      {
        id: "bc-r1-q5",
        type: "text",
        prompt:
          "Which sector or group would you watch most closely next round? Explain what evidence makes it important.",
      },
    ],
  },
  {
    roundNumber: 2,
    questions: [
      {
        id: "bc-r2-q1",
        type: "text",
        prompt:
          "What changed in the mission during Round 2? Focus on movement, meetings, or infection patterns.",
      },
      {
        id: "bc-r2-q2",
        type: "text",
        prompt:
          "Use a data plot to compare Round 2 with Round 1. Is the infection spreading faster, slower, or about the same? What evidence supports your answer?",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: ["Infected Cadets"],
        },
      },
      {
        id: "bc-r2-q3",
        type: "text",
        prompt:
          "Which sector currently seems most important to investigate? Explain whether the plot data, cadet movement, or both shaped your thinking.",
      },
      {
        id: "bc-r2-q4",
        type: "text",
        prompt:
          "What message or recommendation would you give the cadets before Round 3? Include one piece of evidence from the data.",
      },
      {
        id: "bc-r2-q5",
        type: "text",
        prompt:
          "What is your current hypothesis about Patient Zero? Explain what has changed since Round 1.",
      },
    ],
  },
  {
    roundNumber: 3,
    questions: [
      {
        id: "bc-r3-q1",
        type: "text",
        prompt:
          "Looking across all three rounds, describe the overall infection pattern. Did the spread look steady, sudden, or uneven?",
        plotConstraints: {
          plotType: "line",
          xOptions: ["Time"],
          yOptions: ["Infected Cadets", "Infected Sectors"],
        },
      },
      {
        id: "bc-r3-q2",
        type: "text",
        prompt:
          "Which plot or data view was most useful for the bridge crew? Explain why it helped you understand the mission.",
      },
      {
        id: "bc-r3-q3",
        type: "text",
        prompt:
          "What is your final Patient Zero hypothesis? Walk through the strongest evidence for your answer.",
      },
      {
        id: "bc-r3-q4",
        type: "text",
        prompt:
          "How confident are you in your conclusion? What information would have made the bridge crew more certain?",
      },
      {
        id: "bc-r3-q5",
        type: "text",
        prompt:
          "Write one final mission note for the class: what should cadets learn from the data and decisions in this simulation?",
      },
    ],
  },
];
