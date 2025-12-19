/**
 * Layout Types
 * ------------
 * Shared UI layout types for game pages.
 *
 * ScreenMode represents how game content is displayed:
 *   - "single": one panel visible at a time (Journal OR DataPlots)
 *   - "dual":   Journal and DataPlots visible simultaneously
 *
 * This type is intentionally generic so it can be reused
 * across different games and future layouts.
 */


export type ScreenMode = "single" | "dual";
