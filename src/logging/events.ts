/**
 * UserInteractionEvent
 * --------------------
 * Canonical schema for logging user behavior on the platform.
 *
 * These events describe WHAT the user did,
 * not HOW the UI is implemented.
 *
 * This data is collected only (no aggregation here).
 */

export type UserInteractionEvent =
  | {
      type: "ui.toggle_view";
      payload: { from: string; to: string };
    }
  | {
      type: "journal.input";
      payload: { questionId: string; valueLength: number };
    }
  | {
      type: "plot.change_type";
      payload: { plotType: string };
    }
  | {
      type: "plot.change_variable";
      payload: { axis: "x" | "y"; variable: string };
    }
  | {
      type: "layout.screen_mode_changed";
      payload: { screenMode: "single" | "dual" };
    }
  | {
      type: "layout.active_panel_changed";
      payload: { panel: "journal" | "plots" };
    };
