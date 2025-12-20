/**
 * Plot Validation Utilities
 * -------------------------
 * Pure helper functions for validating plot selections
 * against declarative plot configuration.
 *
 * UI components should rely on these helpers instead of
 * hardcoding plot rules.
 */

import { VARIABLES, PLOT_TYPES } from "../config/plots";
import type { PlotType as PlotTypeDef, Variable } from "../types/plots";

/**
 * Look up a plot type definition by id.
 */
export function getPlotType(plotTypeId: string): PlotTypeDef | undefined {
  return PLOT_TYPES.find((p) => p.id === plotTypeId);
}

/**
 * Get all variables that are valid for a given plot type and role.
 *
 * Example:
 *  getValidVariables("line", "x") → temporal + ordinal variables
 */
export function getValidVariables(
  plotTypeId: string,
  role: "x" | "y" | "value"
): Variable[] {
  const plotType = getPlotType(plotTypeId);

  if (!plotType) return [];

  const allowedClasses = plotType.roles[role];
  if (!allowedClasses) return [];

  return VARIABLES.filter((v) =>
    allowedClasses.includes(v.class)
  );
}

/**
 * Validate a full plot selection.
 *
 * Returns true if the selected variables satisfy
 * the plot type's role constraints.
 */
export function isValidPlotSelection(params: {
  plotTypeId: string;
  xVar?: string;
  yVar?: string;
  valueVar?: string;
}): boolean {
  const plotType = getPlotType(params.plotTypeId);
  if (!plotType) return false;

  // Validate X
  if (plotType.roles.x) {
    if (!params.xVar) return false;

    const validX = getValidVariables(params.plotTypeId, "x").some(
      (v) => v.id === params.xVar
    );

    if (!validX) return false;
  }

  // Validate Y
  if (plotType.roles.y) {
    if (!params.yVar) return false;

    const validY = getValidVariables(params.plotTypeId, "y").some(
      (v) => v.id === params.yVar
    );

    if (!validY) return false;
  }

  // Validate histogram value
  if (plotType.roles.value) {
    if (!params.valueVar) return false;

    const validValue = getValidVariables(params.plotTypeId, "value").some(
      (v) => v.id === params.valueVar
    );

    if (!validValue) return false;
  }

  return true;
}
