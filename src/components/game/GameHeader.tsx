/**
 * GameHeader
 * ----------
 * Persistent navigation bar for a game session.
 *
 * This component is fully generic and does not assume
 * any specific game or player identity.
 */

/**
 * GameHeader
 * ----------
 * Persistent navigation bar for a game session.
 *
 * This component is fully generic and does not assume
 * any specific game or player identity.
 */

import type { ScreenMode } from "../../types/layout";

type Props = {
  gameName: string;
  playerName: string;
  screenMode: ScreenMode;
  onToggleMode: () => void;
  activePanel: "journal" | "plots";
  onSelectPanel: (p: "journal" | "plots") => void;
};

function GameHeader({
  gameName,
  playerName,
  screenMode,
  onToggleMode,
  activePanel,
  onSelectPanel,
}: Props) {
  return (
    <header
      style={{
        padding: "0.75rem 1.5rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        position: "relative",
      }}
    >
      {/* Left section - Back button */}
      <button
        style={{
          padding: "0.6rem 1.2rem",
          background: "rgba(255, 255, 255, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "8px",
          color: "white",
          fontWeight: 600,
          fontSize: "0.95rem",
          cursor: "pointer",
          transition: "all 0.3s ease",
          backdropFilter: "blur(10px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        ← Back to Games
      </button>

      {/* Center section - Game and player info */}
      <span
        style={{
          fontWeight: 700,
          fontSize: "1.1rem",
          letterSpacing: "0.5px",
          textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {gameName}
        <span
          style={{
            fontSize: "1.3rem",
            opacity: 0.7,
          }}
        >
          –
        </span>
        <span
          style={{
            background: "rgba(255, 255, 255, 0.25)",
            padding: "0.3rem 0.8rem",
            borderRadius: "6px",
            fontSize: "0.95rem",
            fontWeight: 600,
          }}
        >
          {playerName}
        </span>
      </span>

      {/* Right section - Panel toggles and mode button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        {screenMode === "single" && (
          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              padding: "0.25rem",
              gap: "0.25rem",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <button
              onClick={() => onSelectPanel("journal")}
              disabled={activePanel === "journal"}
              style={{
                padding: "0.5rem 1rem",
                background:
                  activePanel === "journal"
                    ? "rgba(255, 255, 255, 0.95)"
                    : "transparent",
                border: "none",
                borderRadius: "6px",
                color: activePanel === "journal" ? "#764ba2" : "white",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: activePanel === "journal" ? "default" : "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (activePanel !== "journal") {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (activePanel !== "journal") {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              📔 Journal
            </button>
            <button
              onClick={() => onSelectPanel("plots")}
              disabled={activePanel === "plots"}
              style={{
                padding: "0.5rem 1rem",
                background:
                  activePanel === "plots"
                    ? "rgba(255, 255, 255, 0.95)"
                    : "transparent",
                border: "none",
                borderRadius: "6px",
                color: activePanel === "plots" ? "#764ba2" : "white",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: activePanel === "plots" ? "default" : "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (activePanel !== "plots") {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (activePanel !== "plots") {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              📊 DataPlots
            </button>
          </div>
        )}

        <button
          onClick={onToggleMode}
          style={{
            padding: "0.6rem 1.2rem",
            background: "rgba(255, 255, 255, 0.95)",
            border: "none",
            borderRadius: "8px",
            color: "#764ba2",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
          }}
        >
          {screenMode === "single" ? "🖥️ Go Dual Screen" : "📱 Go Single Screen"}
        </button>
      </div>
    </header>
  );
}

export default GameHeader;
