/**
 * Game Registry
 * -------------
 * Centralized, declarative list of all games supported by DataOrganisms.
 *
 * This file acts as the single source of truth for:
 *   - which games exist
 *   - their display names
 *   - whether they are currently enabled
 *
 *
 * This makes the registry safe to consume from UI, routing,
 * and future backend-driven feature flags.
 */


import type { Game } from "../types/game";

export const GAMES: Game[] = [
  { id: "alien-invasion", name: "Alien Invasion", enabled: true },
  { id: "whisper-web", name: "Whisper Web", enabled: false },
  { id: "logistics-league", name: "Logistics League", enabled: false },
  { id: "pollination-party", name: "Pollination Party", enabled: false },
  { id: "rush-hour-rebels", name: "Rush Hour Rebels", enabled: false },
];
