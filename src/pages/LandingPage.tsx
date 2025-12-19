/**
 * LandingPage
 * -----------
 * The entry point of the DataOrganisms platform.
 *
 * Responsibilities:
 *   - Present the list of available games
 *   - Visually distinguish enabled vs disabled games
 *   - Route users into the selected game flow
 *
 *
 * This page is intentionally "dumb" and driven entirely by the
 * central game registry.
 */

import { useNavigate } from "react-router-dom";
import { GAMES } from "../config/games";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "3.5rem",
          fontWeight: 800,
          color: "#ffffff",
          textShadow: "3px 3px 6px rgba(0,0,0,0.2)",
          marginBottom: "0.5rem",
          letterSpacing: "1px",
        }}
      >
        DataOrganisms
      </h1>

      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div style={{ marginTop: "1rem" }}>
          {GAMES.map((game) => (
            <button
              key={game.id}
              disabled={!game.enabled}
              onClick={() => navigate(`/games/${game.id}`)}
              style={{
                display: "block",
                width: "280px",
                marginBottom: "1rem",
                padding: "1.2rem",
                fontSize: "1.2rem",
                fontWeight: 600,
                borderRadius: "15px",
                border: "none",
                cursor: game.enabled ? "pointer" : "not-allowed",
                backgroundColor: game.enabled ? "#ff6b6b" : "#b8b8b8",
                color: "white",
                opacity: game.enabled ? 1 : 0.5,
                boxShadow: game.enabled
                  ? "0 4px 15px rgba(255, 107, 107, 0.4)"
                  : "none",
                transform: "scale(1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (game.enabled) {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(255, 107, 107, 0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (game.enabled) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(255, 107, 107, 0.4)";
                }
              }}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

export default LandingPage;