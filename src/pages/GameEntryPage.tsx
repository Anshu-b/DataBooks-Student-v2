import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { GAMES } from "../config/games";
import { PLAYER_NAMES } from "../config/playerNames";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  onValue,
} from "firebase/database";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .entry-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1a2e;
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(99, 62, 130, 0.35) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(22, 90, 150, 0.25) 0%, transparent 50%),
      radial-gradient(ellipse at 60% 80%, rgba(180, 80, 120, 0.2) 0%, transparent 50%);
    font-family: 'DM Sans', sans-serif;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }

  .entry-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  .back-btn {
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    padding: 7px 14px 7px 10px;
    color: rgba(200, 185, 220, 0.7);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
    color: #f0ece8;
  }

  .entry-card {
    position: relative;
    width: 100%;
    max-width: 500px;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 44px 44px 40px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.05) inset,
      0 40px 80px rgba(0, 0, 0, 0.5),
      0 0 60px rgba(100, 60, 140, 0.2);
    animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .game-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, rgba(139, 79, 207, 0.5), rgba(91, 110, 245, 0.5));
    border: 1px solid rgba(160, 110, 230, 0.4);
    border-radius: 18px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    box-shadow: 0 8px 24px rgba(100, 70, 200, 0.3);
  }

  .game-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: #f0ece8;
    text-align: center;
    margin: 0 0 4px;
    letter-spacing: -0.02em;
  }

  .game-subtitle {
    text-align: center;
    font-size: 13px;
    font-weight: 300;
    color: rgba(200, 190, 210, 0.5);
    margin: 0 0 28px;
    letter-spacing: 0.04em;
  }

  .card-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.07);
    margin: 24px 0;
  }

  .section-label {
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(200, 185, 220, 0.45);
    margin: 0 0 10px;
  }

  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(200, 185, 220, 0.7);
    margin-bottom: 7px;
  }

  .field-hint {
    font-size: 12.5px;
    font-weight: 300;
    color: rgba(200, 185, 220, 0.45);
    margin: 0 0 10px;
  }

  .field-input {
    width: 100%;
    padding: 13px 16px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #f0ece8;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 400;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .field-input::placeholder {
    color: rgba(200, 185, 220, 0.3);
  }

  .field-input:focus {
    border-color: rgba(160, 110, 230, 0.6);
    background: rgba(255, 255, 255, 0.09);
    box-shadow: 0 0 0 3px rgba(140, 90, 200, 0.15);
  }

  .field-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .field-input-error {
    border-color: rgba(220, 60, 80, 0.5) !important;
  }

  .field-input-error:focus {
    border-color: rgba(220, 60, 80, 0.7) !important;
    box-shadow: 0 0 0 3px rgba(220, 60, 80, 0.15) !important;
  }

  .validate-btn {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, #8b4fcf 0%, #5b6ef5 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(100, 70, 200, 0.35);
    position: relative;
    overflow: hidden;
    margin-top: 16px;
  }

  .validate-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
  }

  .validate-btn:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(100, 70, 200, 0.45);
  }

  .validate-btn:disabled {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(200, 185, 220, 0.3);
    cursor: not-allowed;
    box-shadow: none;
  }

  .player-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 4px;
  }

  .player-btn {
    padding: 12px 6px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(200, 185, 220, 0.7);
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    text-align: center;
  }

  .player-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: #f0ece8;
    transform: translateY(-2px);
  }

  .player-btn-selected {
    background: linear-gradient(135deg, rgba(139, 79, 207, 0.35), rgba(91, 110, 245, 0.35)) !important;
    border-color: rgba(160, 110, 230, 0.55) !important;
    color: #f0ece8 !important;
    box-shadow: 0 4px 16px rgba(100, 70, 200, 0.25);
    transform: translateY(-2px);
  }

  .player-btn-used {
    background: rgba(130, 170, 255, 0.12);
    border-color: rgba(130, 170, 255, 0.28);
    color: rgba(220, 228, 255, 0.92);
    box-shadow: inset 0 0 0 1px rgba(130, 170, 255, 0.08);
  }

  .player-btn-used:hover {
    background: rgba(130, 170, 255, 0.18);
    border-color: rgba(130, 170, 255, 0.38);
    color: #f0ece8;
  }

  .player-name-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
  }

  .player-used-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #8db2ff;
    box-shadow: 0 0 8px rgba(141, 178, 255, 0.6);
    flex-shrink: 0;
  }

  .player-used-label {
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(220, 228, 255, 0.72);
    flex-shrink: 0;
  }

  .show-password-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(200, 185, 220, 0.55);
    cursor: pointer;
    margin-top: 10px;
    user-select: none;
  }

  .show-password-label input[type="checkbox"] {
    accent-color: #8b4fcf;
    width: 15px;
    height: 15px;
    cursor: pointer;
  }

  .error-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(220, 60, 80, 0.12);
    border: 1px solid rgba(220, 60, 80, 0.3);
    border-radius: 10px;
    padding: 10px 14px;
    color: #f08090;
    font-size: 13px;
    margin-top: 14px;
    animation: shake 0.3s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25%       { transform: translateX(-4px); }
    75%       { transform: translateX(4px); }
  }

  .action-row {
    display: flex;
    gap: 10px;
    margin-top: 24px;
  }

  .cancel-btn {
    flex: 1;
    padding: 13px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(200, 185, 220, 0.7);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }

  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.18);
    color: #f0ece8;
  }

  .start-btn {
    flex: 2;
    padding: 13px;
    background: linear-gradient(135deg, #8b4fcf 0%, #5b6ef5 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(100, 70, 200, 0.35);
    position: relative;
    overflow: hidden;
  }

  .start-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
  }

  .start-btn:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(100, 70, 200, 0.45);
  }

  .start-btn:disabled {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(200, 185, 220, 0.3);
    cursor: not-allowed;
    box-shadow: none;
  }

  .session-validated-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(60, 180, 120, 0.15);
    border: 1px solid rgba(60, 180, 120, 0.3);
    border-radius: 100px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 500;
    color: #70d4a0;
    margin-left: 10px;
    letter-spacing: 0.04em;
  }

  .session-validated-pill::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #70d4a0;
    box-shadow: 0 0 5px #70d4a0;
  }
`;

function GameEntryPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cadetLimit, setCadetLimit] = useState<number | null>(null);
  const [chosenPlayers, setChosenPlayers] = useState<string[]>([]);

  const game = GAMES.find((g) => g.id === gameId);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const allowedPlayerNames = useMemo(() => {
    const maxNames = Math.min(
      cadetLimit ?? PLAYER_NAMES.length,
      PLAYER_NAMES.length
    );
    return PLAYER_NAMES.slice(0, maxNames);
  }, [cadetLimit]);

  useEffect(() => {
    if (!sessionValidated || !sessionId) {
      setChosenPlayers([]);
      return;
    }

    const db = getDatabase();
    const playersRef = ref(db, `sessions/${sessionId}/players`);

    const unsubscribe = onValue(playersRef, (snapshot) => {
      if (!snapshot.exists()) {
        setChosenPlayers([]);
        return;
      }

      const players = snapshot.val() as Record<
        string,
        { hasChosen?: boolean }
      >;
      const names = Object.entries(players)
        .filter(([, value]) => value?.hasChosen === true)
        .map(([name]) => name);

      setChosenPlayers(names);
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId, sessionValidated]);

  if (!game) {
    return <p style={{ padding: "2rem", color: "#f0ece8" }}>Game not found.</p>;
  }

  const initialGameState = {
    gameId: game.id,
    sessionId,
    player: { name: selectedPlayer },
    currentRound: 1,
    rounds: { 1: { roundNumber: 1, journalAnswers: {} } },
  };

  async function getSessionMetadata(sessionIdValue: string) {
    const db = getDatabase();
    const metadataRef = ref(db, `sessions/${sessionIdValue}/metadata`);
    const snapshot = await get(metadataRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.val();
  }

  async function sessionExists(sessionIdValue: string): Promise<boolean> {
    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionIdValue}`);
    const snapshot = await get(sessionRef);
    return snapshot.exists();
  }

  async function resolvePlayer(
    sessionIdValue: string,
    username: string,
    passwordValue: string
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const db = getDatabase();
    const playerRef = ref(db, `sessions/${sessionIdValue}/players/${username}`);
    const snapshot = await get(playerRef);
    const now = new Date().toISOString();

    if (!snapshot.exists()) {
      await set(playerRef, {
        password: passwordValue,
        createdAt: now,
        lastLoginAt: now,
        hasChosen: true,
      });
      return { ok: true };
    }

    const player = snapshot.val();
    if (player.password !== passwordValue) {
      return {
        ok: false,
        error:
          "Incorrect password for this username. Please check with your teacher if you forgot it.",
      };
    }

    await update(playerRef, {
      lastLoginAt: now,
      hasChosen: true,
    });
    return { ok: true };
  }

  return (
    <>
      <style>{styles}</style>
      <main className="entry-root">
        <button className="back-btn" onClick={() => navigate("/")}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 2L4 7L9 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>

        <div className="entry-card">
          <div className="game-icon">🎮</div>
          <h2 className="game-title">{game.name}</h2>
          <p className="game-subtitle">Enter your session details to begin</p>

          <p className="section-label">Session</p>
          <div style={{ marginBottom: 0 }}>
            <label className="field-label" htmlFor="session-id">
              Session ID
              {sessionValidated && (
                <span className="session-validated-pill">Verified</span>
              )}
            </label>
            <input
              id="session-id"
              className="field-input"
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="e.g. 20250715_period3"
              disabled={sessionValidated}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !sessionValidated &&
                sessionId &&
                !loading &&
                document.getElementById("validate-btn")?.click()
              }
            />
          </div>

          <button
            id="validate-btn"
            className="validate-btn"
            disabled={!sessionId || loading || sessionValidated}
            onClick={async () => {
              setLoading(true);
              setError(null);
              setSelectedPlayer(null);

              try {
                const metadata = await getSessionMetadata(sessionId);

                if (!metadata) {
                  setError("Session ID not found. Please check with your teacher.");
                  setCadetLimit(null);
                  setLoading(false);
                  return;
                }

                const teacherCadetCount = metadata.start?.cadets;

                if (
                  typeof teacherCadetCount !== "number" ||
                  teacherCadetCount <= 0
                ) {
                  setError("This session is missing a valid cadet limit.");
                  setCadetLimit(null);
                  setLoading(false);
                  return;
                }

                setCadetLimit(teacherCadetCount);
                setSessionValidated(true);
                setLoading(false);
              } catch {
                setError("Error validating session.");
                setCadetLimit(null);
                setLoading(false);
              }
            }}
          >
            {loading && !sessionValidated
              ? "Validating…"
              : sessionValidated
              ? "Session Verified ✓"
              : "Validate Session"}
          </button>

          {error && !sessionValidated && (
            <div className="error-box">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6.5" stroke="#f08090" />
                <path
                  d="M7 4v3.5"
                  stroke="#f08090"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="7" cy="10" r="0.75" fill="#f08090" />
              </svg>
              {error}
            </div>
          )}

          {sessionValidated && (
            <>
              <div className="card-divider" />

              <p className="section-label">Identity</p>
              <label className="field-label" style={{ marginBottom: 12 }}>
                Choose your data explorer
              </label>
              <div className="player-grid">
                {allowedPlayerNames.map((name) => {
                  const isChosen = chosenPlayers.includes(name);

                  return (
                    <button
                      key={name}
                      className={`player-btn${
                        selectedPlayer === name ? " player-btn-selected" : ""
                      }${isChosen ? " player-btn-used" : ""}`}
                      onClick={() => setSelectedPlayer(name)}
                    >
                      <span className="player-name-wrap">
                        <span>{name}</span>
                        {isChosen && (
                          <>
                            <span className="player-used-dot" />
                            <span className="player-used-label">Used</span>
                          </>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="card-divider" />

              <p className="section-label">Security</p>
              <div style={{ marginBottom: 14 }}>
                <label className="field-label" htmlFor="password">
                  Password
                </label>
                <p className="field-hint">
                  Protects your work from other students in this class.
                </p>
                <input
                  id="password"
                  className="field-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="confirm-password">
                  Re-enter Password
                </label>
                <input
                  id="confirm-password"
                  className={`field-input${
                    confirmPassword && !passwordsMatch
                      ? " field-input-error"
                      : ""
                  }`}
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
              </div>

              <label className="show-password-label">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                Show password
              </label>

              {confirmPassword && !passwordsMatch && (
                <div className="error-box" style={{ marginTop: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6.5" stroke="#f08090" />
                    <path
                      d="M7 4v3.5"
                      stroke="#f08090"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="7" cy="10" r="0.75" fill="#f08090" />
                  </svg>
                  Passwords do not match.
                </div>
              )}

              {error && sessionValidated && (
                <div className="error-box">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6.5" stroke="#f08090" />
                    <path
                      d="M7 4v3.5"
                      stroke="#f08090"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="7" cy="10" r="0.75" fill="#f08090" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="action-row">
                <button className="cancel-btn" onClick={() => navigate("/")}>
                  Cancel
                </button>
                <button
                  className="start-btn"
                  disabled={
                    !selectedPlayer ||
                    !sessionValidated ||
                    !passwordsMatch ||
                    loading
                  }
                  onClick={async () => {
                    if (!selectedPlayer || !sessionId || !password) {
                      return;
                    }

                    setLoading(true);
                    setError(null);

                    try {
                      const exists = await sessionExists(sessionId);

                      if (!exists) {
                        setError("Session ID not found. Please check with your teacher.");
                        setLoading(false);
                        return;
                      }

                      if (!allowedPlayerNames.includes(selectedPlayer)) {
                        setError("That player slot is not available for this session.");
                        setLoading(false);
                        return;
                      }

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

                      navigate(`/games/${game.id}/play`, {
                        state: { initialGameState },
                      });
                    } catch (err) {
                      console.error(err);
                      setError("Error joining session. Please try again.");
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Checking…" : "Start Adventure →"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default GameEntryPage;