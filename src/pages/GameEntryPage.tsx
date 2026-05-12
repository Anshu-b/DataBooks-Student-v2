import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GAMES } from "../config/games";
import { getDatabase, ref, get, update } from "firebase/database";
import { useSessionParticipants } from "../hooks/useSessionParticipants";
import type { ParticipantType } from "../types/gameState";
import { ensureStudentFirebaseAccess } from "../firebase/ensureStudentFirebaseAccess";

type AllowedParticipant = {
  id: string;
  type: ParticipantType;
};

function getParticipantKey(participant: AllowedParticipant): string {
  return `${participant.type}:${participant.id}`;
}

function getParticipantTypeLabel(type: ParticipantType): string {
  return type === "player" ? "Cadet" : "Bridge Crew";
}

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
    flex-wrap: wrap;
  }

  .participant-type-pill {
    border-radius: 100px;
    padding: 2px 7px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(220, 228, 255, 0.72);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    flex-shrink: 0;
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

  const [selectedParticipantKey, setSelectedParticipantKey] = useState<
    string | null
  >(null);
  const [sessionId, setSessionId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [allowedParticipants, setAllowedParticipants] = useState<
    AllowedParticipant[]
  >([]);

  const game = GAMES.find((g) => g.id === gameId);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const { participants } = useSessionParticipants(
    sessionValidated && sessionId ? sessionId : null
  );

  const chosenParticipantKeys = useMemo(() => {
    return participants
      .filter((participant) => participant.hasChosen === true)
      .map(getParticipantKey);
  }, [participants]);

  const selectedParticipant = useMemo(() => {
    if (!selectedParticipantKey) {
      return null;
    }

    return (
      allowedParticipants.find(
        (participant) => getParticipantKey(participant) === selectedParticipantKey
      ) ?? null
    );
  }, [allowedParticipants, selectedParticipantKey]);

  if (!game) {
    return <p style={{ padding: "2rem", color: "#f0ece8" }}>Game not found.</p>;
  }

  async function getSessionMetadata(sessionIdValue: string) {
    const db = getDatabase();
    const metadataRef = ref(db, `sessions/${sessionIdValue}/metadata`);
    const snapshot = await get(metadataRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.val();
  }

  async function getSessionParticipants(
    sessionIdValue: string
  ): Promise<AllowedParticipant[]> {
    const db = getDatabase();
    const playersRef = ref(db, `sessions/${sessionIdValue}/players`);
    const nonPlayersRef = ref(db, `sessions/${sessionIdValue}/nonPlayers`);
    const [playersSnapshot, nonPlayersSnapshot] = await Promise.all([
      get(playersRef),
      get(nonPlayersRef),
    ]);

    const players =
      playersSnapshot.exists() &&
      typeof playersSnapshot.val() === "object" &&
      playersSnapshot.val() !== null
        ? Object.keys(playersSnapshot.val() as Record<string, unknown>).map(
            (id) => ({ id, type: "player" as ParticipantType })
          )
        : [];

    const nonPlayers =
      nonPlayersSnapshot.exists() &&
      typeof nonPlayersSnapshot.val() === "object" &&
      nonPlayersSnapshot.val() !== null
        ? Object.keys(nonPlayersSnapshot.val() as Record<string, unknown>).map(
            (id) => ({ id, type: "nonPlayer" as ParticipantType })
          )
        : [];

    return [...players, ...nonPlayers].sort((left, right) => {
      if (left.type !== right.type) {
        return left.type === "player" ? -1 : 1;
      }

      return left.id.localeCompare(right.id);
    });
  }

  async function sessionExists(sessionIdValue: string): Promise<boolean> {
    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionIdValue}`);
    const snapshot = await get(sessionRef);

    return snapshot.exists();
  }

  async function resolveParticipant(
    sessionIdValue: string,
    participant: AllowedParticipant,
    passwordValue: string
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const db = getDatabase();
    const participantCollection =
      participant.type === "player" ? "players" : "nonPlayers";
    const participantRef = ref(
      db,
      `sessions/${sessionIdValue}/${participantCollection}/${participant.id}`
    );
    const snapshot = await get(participantRef);
    const now = new Date().toISOString();

    if (!snapshot.exists()) {
      return {
        ok: false,
        error:
          "This participant is not listed in the session roster. Please check with your teacher.",
      };
    }

    const player = snapshot.val();

    if (
      typeof player !== "object" ||
      player === null
    ) {
      return {
        ok: false,
        error:
          "This participant roster entry is invalid. Please check with your teacher.",
      };
    }

    const playerData = player as {
      password?: string;
      hasChosen?: boolean;
      createdAt?: string;
      lastLoginAt?: string;
    };

    if (!playerData.password) {
      await update(participantRef, {
        password: passwordValue,
        lastLoginAt: now,
        hasChosen: true,
      });

      return { ok: true };
    }

    if (playerData.password !== passwordValue) {
      return {
        ok: false,
        error:
          "Incorrect password for this participant. Please check with your teacher if you forgot it.",
      };
    }

    await update(participantRef, {
      lastLoginAt: now,
      hasChosen: true,
    });

    return { ok: true };
  }

  async function handleValidateSession() {
    setLoading(true);
    setError(null);
    setSelectedParticipantKey(null);
    setAllowedParticipants([]);

    try {
      await ensureStudentFirebaseAccess();
      const metadata = await getSessionMetadata(sessionId);

      if (!metadata) {
        setError("Session ID not found. Please check with your teacher.");
        setLoading(false);
        return;
      }

      const teacherParticipants = await getSessionParticipants(sessionId);

      if (teacherParticipants.length === 0) {
        setError("This session is missing a valid participant roster.");
        setLoading(false);
        return;
      }

      setAllowedParticipants(teacherParticipants);
      setSessionValidated(true);
      setLoading(false);
    } catch {
      setError("Error validating session.");
      setAllowedParticipants([]);
      setLoading(false);
    }
  }

  async function handleStartAdventure() {
    if (!selectedParticipant || !sessionId || !password) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ensureStudentFirebaseAccess();
      const exists = await sessionExists(sessionId);

      if (!exists) {
        setError("Session ID not found. Please check with your teacher.");
        setLoading(false);
        return;
      }

      if (
        !allowedParticipants.some(
          (participant) =>
            getParticipantKey(participant) ===
            getParticipantKey(selectedParticipant)
        )
      ) {
        setError("That participant slot is not available for this session.");
        setLoading(false);
        return;
      }

      const result = await resolveParticipant(
        sessionId,
        selectedParticipant,
        password
      );

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      navigate(`/games/${gameId}/play`, {
        state: {
          initialGameState: {
            gameId: game.id,
            sessionId,
            player: { name: selectedParticipant.id },
            participantType: selectedParticipant.type,
            currentRound: 1,
            rounds: { 1: { roundNumber: 1, journalAnswers: {} } },
          },
        },
      });
    } catch (err) {
      console.error(err);
      setError("Error joining session. Please try again.");
      setLoading(false);
    }
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
              placeholder="e.g. period3-biology-apr22"
              disabled={sessionValidated}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !sessionValidated &&
                sessionId &&
                !loading &&
                handleValidateSession()
              }
            />
          </div>

          <button
            id="validate-btn"
            className="validate-btn"
            disabled={!sessionId || loading || sessionValidated}
            onClick={handleValidateSession}
          >
            {loading && !sessionValidated
              ? "Validating…"
              : sessionValidated
              ? "Session Verified ✓"
              : "Validate Session"}
          </button>

          {error && !sessionValidated && (
            <div className="error-box">{error}</div>
          )}

          {sessionValidated && (
            <>
              <div className="card-divider" />

              <p className="section-label">Identity</p>
              <label className="field-label" style={{ marginBottom: 12 }}>
                Choose your mission identity
              </label>

              <div className="player-grid">
                {allowedParticipants.map((participant) => {
                  const participantKey = getParticipantKey(participant);
                  const isChosen = chosenParticipantKeys.includes(participantKey);

                  return (
                    <button
                      key={participantKey}
                      className={`player-btn${
                        selectedParticipantKey === participantKey
                          ? " player-btn-selected"
                          : ""
                      }${isChosen ? " player-btn-used" : ""}`}
                      onClick={() => setSelectedParticipantKey(participantKey)}
                    >
                      <span className="player-name-wrap">
                        <span>{participant.id}</span>
                        <span className="participant-type-pill">
                          {getParticipantTypeLabel(participant.type)}
                        </span>
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
                  Protects your work from other participants in this class.
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
                  Passwords do not match.
                </div>
              )}

              {error && sessionValidated && (
                <div className="error-box">{error}</div>
              )}

              <div className="action-row">
                <button className="cancel-btn" onClick={() => navigate("/")}>
                  Cancel
                </button>

                <button
                  className="start-btn"
                  disabled={
                    !selectedParticipant ||
                    !sessionValidated ||
                    !passwordsMatch ||
                    loading
                  }
                  onClick={handleStartAdventure}
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
