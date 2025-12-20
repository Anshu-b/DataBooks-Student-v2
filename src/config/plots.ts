/**
 * Plot Configuration
 * ------------------
 * Declarative registry of:
 *  - Variables that can be plotted
 *  - Plot types and the semantic roles they accept
 *
 * This file is the single source of truth for:
 *  - Plot builder UI
 *  - Variable dropdowns
 *  - Validation of plot selections
 *
 * No rendering logic should live here.
 */

import type { PlotType, Variable } from "../types/plots";

/**
 * VARIABLES
 * ---------
 * Each variable corresponds directly to a field produced by
 * aggregateTelemetry().
 *
 * The `class` field describes the semantic role of the variable,
 * not how it is rendered.
 */
export const VARIABLES: Variable[] = [
  // Temporal
  { id: "time", label: "Time", class: "temporal" },

  // Ordinal / interaction
  { id: "meetingsHeld", label: "Meetings Held", class: "ordinal" },

  // Cadet state
  { id: "infectedCadets", label: "Infected Cadets", class: "quantitative" },
  { id: "healthyCadets", label: "Healthy Cadets", class: "quantitative" },
  { id: "totalCadets", label: "Total Cadets", class: "quantitative" },

  // Sector state
  { id: "infectedSectors", label: "Infected Sectors", class: "quantitative" },
  { id: "healthySectors", label: "Healthy Sectors", class: "quantitative" },
  { id: "totalSectors", label: "Total Sectors", class: "quantitative" },
];

/**
 * PLOT TYPES
 * ----------
 * Defines which semantic classes are allowed in each plot role.
 *
 * The UI should use this to:
 *  - Filter variable dropdowns
 *  - Prevent invalid plot configurations
 */
export const PLOT_TYPES: PlotType[] = [
  {
    id: "line",
    label: "Line Plot",
    roles: {
      x: ["temporal", "ordinal"],
      y: ["quantitative"],
    },
  },
  {
    id: "scatter",
    label: "Scatter Plot",
    roles: {
      x: ["quantitative"],
      y: ["quantitative"],
    },
  },
  {
    id: "histogram",
    label: "Histogram",
    roles: {
      value: ["quantitative", "ordinal"],
    },
  },
];
