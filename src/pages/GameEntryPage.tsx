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
import { getDatabase, ref, get, set, update } from "firebase/database";


function GameEntryPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState("");

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const game = GAMES.find((g) => g.id === gameId);

  const [sessionValidated, setSessionValidated] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordsMatch = password.length > 0 && password === confirmPassword;  


  if (!game) {
    return <p style={{ padding: "2rem" }}>Game not found.</p>;
  }

  const initialGameState = {
    gameId: game.id,
    sessionId,
    player: { name: selectedPlayer },
    currentRound: 1,
    rounds: {
      1: { roundNumber: 1, journalAnswers: {} },
    },
  };

  // Check if session exists in Firebase Realtime Database
  async function sessionExists(sessionId: string): Promise<boolean> {
    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionId}`);
    const snapshot = await get(sessionRef);
    return snapshot.exists();
  }

  // Resolve player identity and password
  async function resolvePlayer(
    sessionId: string,
    username: string,
    password: string
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const db = getDatabase();
    const playerRef = ref(db, `sessions/${sessionId}/players/${username}`);
    const snapshot = await get(playerRef);
    const now = new Date().toISOString();
  
    // Case A: first-time player → create record
    if (!snapshot.exists()) {
      await set(playerRef, {
        password,
        createdAt: now,
        lastLoginAt: now,
      });
      return { ok: true };
    }
  
    // Case B: returning player → check password
    const player = snapshot.val();
    if (player.password !== password) {
      return {
        ok: false,
        error: "Incorrect password for this username. Please check with your teacher if you forgot it.",
      };
    }
  
    // Password matches → update last login
    await update(playerRef, {
      lastLoginAt: now,
    });
  
    return { ok: true };
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
        
        {/* Session ID input */}
        <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#4a5568",
              marginBottom: "0.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
          Session ID
          </label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="e.g. 20250715_period3"
            disabled={sessionValidated}
            style={{
              width: "100%",
              padding: "1rem",
              fontSize: "1rem",
              fontWeight: 500,
              color: "#2d3748",
              background: sessionValidated ? "#f7fafc" : "#ffffff",
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
              outline: "none",
              transition: "all 0.3s ease",
              cursor: sessionValidated ? "not-allowed" : "text",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              if (!sessionValidated) {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <button
          disabled={!sessionId || loading || sessionValidated}
          onClick={async () => {
            setLoading(true);
            setError(null);

            try {
              const exists = await sessionExists(sessionId);
              if (!exists) {
                setError("Session ID not found. Please check with your teacher.");
                setLoading(false);
                return;
              }

              setSessionValidated(true);
              setLoading(false);
            } catch {
              setError("Error validating session.");
              setLoading(false);
            }
          }}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "white",
            background: (!sessionId || loading || sessionValidated)
              ? "#cbd5e0"
              : "linear-gradient(135deg, #667eea, #764ba2)",
            border: "none",
            borderRadius: "12px",
            cursor: (!sessionId || loading || sessionValidated) ? "not-allowed" : "pointer",
            boxShadow: (!sessionId || loading || sessionValidated)
              ? "none"
              : "0 4px 15px rgba(102, 126, 234, 0.4)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!sessionId || loading || sessionValidated) return;
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
          }}
          onMouseLeave={(e) => {
            if (!sessionId || loading || sessionValidated) return;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
          }}
        >
          {loading ? "Validating..." : "Validate Session"}
        </button>

    {sessionValidated && (
    <>
    {/* identity selection + password UI */}
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

        {/* Password */}
<div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
  <label
    style={{
      display: "block",
      fontSize: "0.9rem",
      fontWeight: 600,
      color: "#4a5568",
      marginBottom: "0.5rem",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }}
  >
    🔐 Password
  </label>
  <p
    style={{
      fontSize: "0.9rem",
      color: "#718096",
      marginBottom: "0.5rem",
      marginTop: "0.25rem",
    }}
  >
    This protects your work from other students in this class.
  </p>
  <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter password"
    style={{
      width: "100%",
      padding: "1rem",
      fontSize: "1rem",
      fontWeight: 500,
      color: "#2d3748",
      background: "#ffffff",
      border: "2px solid #e2e8f0",
      borderRadius: "10px",
      outline: "none",
      transition: "all 0.3s ease",
      boxSizing: "border-box",
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "#667eea";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "#e2e8f0";
      e.currentTarget.style.boxShadow = "none";
    }}
  />
</div>

    {/* Confirm Password */}
    <div style={{ marginBottom: "1rem", textAlign: "left" }}>
      <label
        style={{
          display: "block",
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#4a5568",
          marginBottom: "0.5rem",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        🔁 Re-enter Password
      </label>
      <input
        type={showPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Re-enter password"
        style={{
          width: "100%",
          padding: "1rem",
          fontSize: "1rem",
          fontWeight: 500,
          color: "#2d3748",
          background: "#ffffff",
          border: confirmPassword && !passwordsMatch 
            ? "2px solid #e53e3e" 
            : "2px solid #e2e8f0",
          borderRadius: "10px",
          outline: "none",
          transition: "all 0.3s ease",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          if (confirmPassword && !passwordsMatch) {
            e.currentTarget.style.borderColor = "#e53e3e";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(229, 62, 62, 0.1)";
          } else {
            e.currentTarget.style.borderColor = "#667eea";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
          }
        }}
        onBlur={(e) => {
          if (confirmPassword && !passwordsMatch) {
            e.currentTarget.style.borderColor = "#e53e3e";
            e.currentTarget.style.boxShadow = "none";
          } else {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      />
    </div>

    {/* Show password toggle */}
    <label
      style={{
        display: "flex",
        alignItems: "center",
        fontSize: "0.9rem",
        color: "#4a5568",
        fontWeight: 500,
        cursor: "pointer",
        marginBottom: "1rem",
      }}
    >
      <input
        type="checkbox"
        checked={showPassword}
        onChange={(e) => setShowPassword(e.target.checked)}
        style={{
          marginRight: "0.5rem",
          width: "18px",
          height: "18px",
          cursor: "pointer",
        }}
      />
      👁️ Show password
    </label>

    {/* Password mismatch warning */}
    {confirmPassword && !passwordsMatch && (
      <div
        style={{
          color: "#c53030",
          fontSize: "0.9rem",
          marginTop: "0.5rem",
          marginBottom: "0.8rem",
          background: "rgba(229, 62, 62, 0.1)",
          padding: "0.75rem",
          borderRadius: "8px",
          border: "1px solid rgba(229, 62, 62, 0.2)",
          fontWeight: 500,
        }}
      >
        ⚠️ Passwords do not match.
      </div>
    )}

        {error && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                borderRadius: "10px",
                background: "#fed7d7",
                color: "#9b2c2c",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}


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
            disabled={!selectedPlayer || !sessionValidated || !passwordsMatch || loading}
            onClick={async () => {
              if (!selectedPlayer || !sessionId || !password) return;
            
              setLoading(true);
              setError(null);
            
              try {
                // Step 2: validate session exists
                const exists = await sessionExists(sessionId);
                if (!exists) {
                  setError("Session ID not found. Please check with your teacher.");
                  setLoading(false);
                  return;
                }
            
                // Step 3: resolve player + password
                const result = await resolvePlayer(
                  sessionId,
                  selectedPlayer,
                  password
                );
            
                if (!result.ok) {
                  setError(result.error);
                  setLoading(false);
                  return;
                }
            
                // Success → proceed (GameState comes next step)
                navigate(`/games/${game.id}/play`, {
                  state: { initialGameState },
                });
                
              } catch (err) {
                console.error(err);
                setError("Error joining session. Please try again.");
                setLoading(false);
              }
            }}
            
                      
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
            {loading ? "Checking session..." : "Start Adventure! 🚀"}
          </button>
        </div>

        </>
      )}
      </div>
      
    </main>
  );
}

export default GameEntryPage;