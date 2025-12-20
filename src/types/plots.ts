/**
 * Plot Types
 * ----------
 * Canonical typing for plot definitions and variable compatibility.
 */

export type VariableClass =
  | "temporal"
  | "ordinal"
  | "quantitative";

export type Variable = {
  id: string;
  label: string;
  class: VariableClass;
};

export type PlotRole = "x" | "y" | "value";

export type PlotType = {
  id: "line" | "scatter" | "histogram";
  label: string;
  roles: Partial<Record<PlotRole, VariableClass[]>>;
};
