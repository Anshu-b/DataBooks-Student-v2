/**
 * GameEntryPage
 * -------------
 * Pre-game identity selection screen.
 *
 * This page is shared across all games and is responsible for:
 *   - displaying the selected game
 *   - allowing the user to choose a player identity
 *   - gating entry into the actual game
 */

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GAMES } from "../config/games";
import { PLAYER_NAMES } from "../config/playerNames";

function GameEntryPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  const game = GAMES.find((g) => g.id === gameId);

  if (!game) {
    return <p style={{ padding: "2rem" }}>Game not found.</p>;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background decoration */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px, 80px 80px, 60px 60px",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "24px",
          padding: "2.5rem",
          width: "480px",
          maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          textAlign: "center",
          border: "2px solid rgba(255, 255, 255, 0.5)",
          position: "relative",
        }}
      >
        {/* Data decorations */}
        <div
          style={{
            position: "absolute",
            left: "-20px",
            top: "50%",
            transform: "translateY(-50%) rotate(-15deg)",
            fontSize: "4rem",
            opacity: 0.1,
            pointerEvents: "none",
          }}
        >
        {/* insert emoji */}
        </div>
        <div
          style={{
            position: "absolute",
            right: "-20px",
            top: "50%",
            transform: "translateY(-50%) rotate(15deg)",
            fontSize: "4rem",
            opacity: 0.1,
            pointerEvents: "none",
          }}
        >
        {/* insert emoji */}
        </div>

        {/* Game icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #ff6b6b, #ff8e53)",
            borderRadius: "20px",
            margin: "0 auto 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            boxShadow: "0 8px 20px rgba(255, 107, 107, 0.4)",
          }}
        >
          🎮
        </div>

        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#2d3748",
            marginBottom: "0.5rem",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {game.name}
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            marginBottom: "2rem",
            color: "#718096",
            fontWeight: 500,
          }}
        >
          Choose Your Data Explorer!
        </p>

        {/* Section title */}
        <div
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#4a5568",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <span>👤</span>
          <span>Select Identity</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
        >
          {PLAYER_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedPlayer(name)}
              onMouseEnter={() => setHoveredPlayer(name)}
              onMouseLeave={() => setHoveredPlayer(null)}
              style={{
                padding: "1rem 0.6rem",
                borderRadius: "12px",
                border:
                  selectedPlayer === name
                    ? "2px solid #667eea"
                    : "2px solid transparent",
                background:
                  selectedPlayer === name
                    ? "linear-gradient(135deg, #eef1ff, #e9d5ff)"
                    : "#f7fafc",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#2d3748",
                transition: "all 0.3s ease",
                transform:
                  selectedPlayer === name
                    ? "scale(1.05)"
                    : hoveredPlayer === name
                    ? "translateY(-2px)"
                    : "scale(1)",
                boxShadow:
                  selectedPlayer === name
                    ? "0 4px 15px rgba(102, 126, 234, 0.4)"
                    : hoveredPlayer === name
                    ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                    : "none",
              }}
            >
              {name}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              flex: 1,
              padding: "1rem",
              borderRadius: "12px",
              border: "2px solid #e2e8f0",
              background: "white",
              color: "#4a5568",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f7fafc";
              e.currentTarget.style.borderColor = "#cbd5e0";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ← Back to Games
          </button>

          <button
            disabled={!selectedPlayer}
            onClick={() =>
              navigate(`/games/${game.id}/play`, {
                state: { playerName: selectedPlayer },
              })
            }
            style={{
              flex: 1,
              padding: "1rem",
              borderRadius: "12px",
              border: "none",
              background: selectedPlayer
                ? "linear-gradient(135deg, #667eea, #764ba2)"
                : "#cbd5e0",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: selectedPlayer ? "pointer" : "not-allowed",
              boxShadow: selectedPlayer
                ? "0 4px 15px rgba(102, 126, 234, 0.4)"
                : "none",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (selectedPlayer) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(102, 126, 234, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPlayer) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 15px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            Start Adventure! 🚀
          </button>
        </div>
      </div>
    </main>
  );
}

export default GameEntryPage;