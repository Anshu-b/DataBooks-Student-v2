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
 * This page is intentionally "dumb" and driven entirely by the
 * central game registry.
 */

import { useNavigate, Navigate } from "react-router-dom";
import { GAMES } from "../config/games";
import { useRole } from "../state/RoleContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .landing-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
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

  .landing-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  /* ── Instructor badge ── */
  .instructor-badge {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    display: flex;
    align-items: center;
    gap: 7px;
    background: rgba(140, 90, 200, 0.2);
    border: 1px solid rgba(160, 110, 220, 0.35);
    border-radius: 100px;
    padding: 7px 16px 7px 12px;
    color: #c4a0f0;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.06em;
    animation: fadeIn 0.4s ease both;
  }

  .instructor-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a070e0;
    box-shadow: 0 0 6px #a070e0;
  }

  /* ── Back button ── */
  .back-to-role-btn {
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
    animation: fadeIn 0.4s ease both;
  }

  .back-to-role-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
    color: #f0ece8;
  }

  /* ── Hero heading ── */
  .landing-hero {
    text-align: center;
    margin-bottom: 2.5rem;
    animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .landing-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.8rem, 6vw, 4.5rem);
    font-weight: 800;
    color: #f0ece8;
    margin: 0 0 10px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .landing-title span {
    background: linear-gradient(135deg, #b08ae0, #6b8ef5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .landing-tagline {
    font-size: 15px;
    font-weight: 300;
    color: rgba(200, 190, 210, 0.55);
    letter-spacing: 0.04em;
    margin: 0;
  }

  /* ── Card container ── */
  .landing-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 36px 40px;
    width: 100%;
    max-width: 380px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.05) inset,
      0 40px 80px rgba(0, 0, 0, 0.5),
      0 0 60px rgba(100, 60, 140, 0.2);
    animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
  }

  .card-section-label {
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(200, 185, 220, 0.45);
    margin: 0 0 12px;
  }

  .card-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.07);
    margin: 20px 0;
  }

  /* ── Buttons ── */
  .game-btn,
  .control-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 14px 18px;
    margin-bottom: 10px;
    border: 1px solid transparent;
    border-radius: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.18s, box-shadow 0.18s, background 0.18s, border-color 0.18s;
    text-align: left;
  }

  .game-btn:last-child,
  .control-btn:last-child {
    margin-bottom: 0;
  }

  /* Control Panel button */
  .control-btn {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
    color: #f0ece8;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  /* Enabled game button */
  .game-btn-enabled {
    background: linear-gradient(135deg, rgba(139, 79, 207, 0.35) 0%, rgba(91, 110, 245, 0.35) 100%);
    border-color: rgba(160, 110, 230, 0.35);
    color: #f0ece8;
    box-shadow: 0 4px 20px rgba(100, 70, 200, 0.2);
  }

  .game-btn-enabled:hover {
    background: linear-gradient(135deg, rgba(139, 79, 207, 0.5) 0%, rgba(91, 110, 245, 0.5) 100%);
    border-color: rgba(160, 110, 230, 0.55);
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(100, 70, 200, 0.35);
  }

  /* Disabled game button */
  .game-btn-disabled {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.06);
    color: rgba(200, 185, 220, 0.3);
    cursor: not-allowed;
  }

  .btn-icon {
    font-size: 17px;
    flex-shrink: 0;
  }

  .btn-label {
    flex: 1;
    padding: 0 12px;
  }

  .btn-arrow {
    opacity: 0.4;
    flex-shrink: 0;
    transition: opacity 0.18s, transform 0.18s;
  }

  .game-btn-enabled:hover .btn-arrow,
  .control-btn:hover .btn-arrow {
    opacity: 0.8;
    transform: translateX(3px);
  }

  .coming-soon-tag {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    padding: 2px 8px;
    color: rgba(200, 185, 220, 0.35);
    flex-shrink: 0;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

function LandingPage() {
  const navigate = useNavigate();
  const { role, isTeacher, setRole } = useRole();
  if (!role) {
    return <Navigate to="/select-role" replace />;
  }

  return (
    <>
      <style>{styles}</style>
      <main className="landing-root">

        <button className="back-to-role-btn" onClick={() => {
          setRole(null);
          navigate("/select-role");
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {isTeacher && (
          <div className="instructor-badge">
            <span className="instructor-dot" />
            Instructor Version
          </div>
        )}

        {!isTeacher && (
          <div className="instructor-badge">
            <span className="instructor-dot" />
            Student Version
          </div>
        )}

        <div className="landing-hero">
          <h1 className="landing-title">
            Data<span>Organisms</span>
          </h1>
          <p className="landing-tagline">Select a game to begin</p>
        </div>

        <div className="landing-card">

          {isTeacher && (
            <>
              <p className="card-section-label">Management</p>
              <button className="game-btn control-btn" onClick={() => navigate("/teacher")}>
                <span className="btn-icon">🎓</span>
                <span className="btn-label">Control Panel</span>
                <svg className="btn-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="card-divider" />
            </>
          )}

          <p className="card-section-label">Games</p>

          {GAMES.map((game) =>
            game.enabled ? (
              <button
                key={game.id}
                className="game-btn game-btn-enabled"
                onClick={() => navigate(`/games/${game.id}`)}
              >
                <span className="btn-icon">🧬</span>
                <span className="btn-label">{game.name}</span>
                <svg className="btn-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : (
              <button
                key={game.id}
                className="game-btn game-btn-disabled"
                disabled
              >
                <span className="btn-icon">🔒</span>
                <span className="btn-label">{game.name}</span>
                <span className="coming-soon-tag">Soon</span>
              </button>
            )
          )}

        </div>
      </main>
    </>
  );
}

export default LandingPage;