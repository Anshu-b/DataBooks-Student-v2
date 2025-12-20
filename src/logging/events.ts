/**
 * UserInteractionEvent
 * --------------------
 * Canonical event schema for UI interaction logging.
 *
 * These events are platform-wide and storage-agnostic.
 */

export type UserInteractionEvent =
  | LayoutScreenModeChanged
  | LayoutActivePanelChanged
  | PlotTypeChanged
  | PlotVariableChanged
  | JournalResponseEdited
  | JournalInputFocused
  | JournalInputCommitted;

type Panel = "journal" | "plots";

export type LayoutScreenModeChanged = {
  type: "layout.screen_mode_changed";
  action: "single_to_dual" | "dual_to_single";
  details: {
    from: "single" | "dual";
    to: "single" | "dual";
  };
};

export type LayoutActivePanelChanged = {
  type: "layout.active_panel_changed";
  action: `${Panel}_to_${Panel}`;
  details: {
    from: Panel;
    to: Panel;
  };
};

export type PlotTypeChanged = {
  type: "plot.type_changed";
  action: string; // e.g. "line", "scatter", "histogram"
  details: {
    from: string;
    to: string;
  };
};

export type PlotVariableChanged = {
  type: "plot.change_variable";
  action:
    | "x_variable_changed"
    | "y_variable_changed"
    | "value_variable_changed";
  plotType: "line" | "scatter" | "histogram";
  details: {
    axis: "x" | "y" | "value";
    from: string | undefined;
    to: string | undefined;
  };
};


export type JournalResponseEdited = {
  type: "journal.response_edited";
  action: "text_updated";
  details: {
    questionIndex: number;
    length: number;
  };
};

export type JournalInputFocused = {
  type: "journal.input";
  action: "answer_focused";
  details: {
    round: number;
    questionIndex: number;
  };
};

export type JournalInputCommitted = {
  type: "journal.input";
  action: "answer_committed";
  details: {
    round: number;
    questionIndex: number;
    length: number;
  };
};