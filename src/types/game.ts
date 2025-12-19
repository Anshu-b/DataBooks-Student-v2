/**
 * Game
 * ----
 * Domain type representing a single game offered on DataOrganisms.
 *
 * This type is intentionally minimal and UI-agnostic. It defines
 * only the stable metadata needed to:
 *   - render the landing page
 *   - control routing
 *   - enable/disable games
 *
 * Additional game-specific configuration (visuals, gameplay logic, etc.) 
 * should live elsewhere.
 */


export type Game = {
    id: string;
    name: string;
    enabled: boolean;
  };
  