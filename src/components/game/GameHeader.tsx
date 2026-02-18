/**
 * GameHeader
 * ----------
 * Persistent navigation bar for a game session.
 *
 * This component is fully generic and does not assume
 * any specific game or player identity.
 */

import type { ScreenMode } from "../../types/layout";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

  .header-root {
    padding: 12px 24px;
    background: rgba(26, 26, 46, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'DM Sans', sans-serif;
    position: relative;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-logout-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px 7px 10px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    color: rgba(200, 185, 220, 0.7);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }

  .header-logout-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
    color: #f0ece8;
  }

  .header-session-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(102, 126, 234, 0.12);
    border: 1px solid rgba(102, 126, 234, 0.25);
    border-radius: 100px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(180, 190, 230, 0.8);
  }

  .session-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .session-status-active {
    background: #48bb78;
    box-shadow: 0 0 6px rgba(72, 187, 120, 0.5);
  }

  .session-status-paused {
    background: #ecc94b;
    box-shadow: 0 0 6px rgba(236, 201, 75, 0.5);
  }

  .session-status-inactive {
    background: #f56565;
    box-shadow: 0 0 6px rgba(245, 101, 101, 0.5);
  }

  .header-center {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-game-name {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: #f0ece8;
    letter-spacing: -0.01em;
  }

  .header-separator {
    font-size: 16px;
    color: rgba(200, 185, 220, 0.3);
  }

  .header-player-badge {
    background: linear-gradient(135deg, rgba(139, 79, 207, 0.3), rgba(91, 110, 245, 0.3));
    border: 1px solid rgba(160, 110, 230, 0.35);
    border-radius: 100px;
    padding: 4px 12px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(200, 190, 230, 0.9);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .panel-toggle-group {
    display: flex;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    padding: 3px;
    gap: 2px;
  }

  .panel-toggle-btn {
    padding: 6px 14px;
    border: none;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    background: transparent;
    color: rgba(200, 185, 220, 0.7);
  }

  .panel-toggle-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    color: #f0ece8;
  }

  .panel-toggle-btn:disabled {
    background: rgba(139, 79, 207, 0.35);
    color: #f0ece8;
    cursor: default;
    box-shadow: 0 2px 8px rgba(100, 70, 200, 0.2);
  }

  .header-mode-btn {
    padding: 7px 16px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    border-radius: 100px;
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);
    position: relative;
    overflow: hidden;
  }

  .header-mode-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  }

  .header-mode-btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }

  .header-mode-btn:active {
    transform: translateY(0);
  }
`;

type Props = {
  gameName: string;
  playerName: string;
  sessionId: string;
  sessionStatus: "active" | "paused" | "inactive";
  screenMode: ScreenMode;
  onToggleMode: () => void;
  activePanel: "journal" | "plots";
  onSelectPanel: (p: "journal" | "plots") => void;
};

function GameHeader({
  gameName,
  playerName,
  sessionId,
  sessionStatus,
  screenMode,
  onToggleMode,
  activePanel,
  onSelectPanel,
}: Props) {
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>
      <header className="header-root">

        {/* Left section */}
        <div className="header-left">
          <button className="header-logout-btn" onClick={() => navigate("/")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Log Out
          </button>

          <span className="header-session-badge">
            <span 
              className={`session-status-dot ${
                sessionStatus === "active" ? "session-status-active" :
                sessionStatus === "paused" ? "session-status-paused" :
                "session-status-inactive"
              }`}
            />
            {sessionId}
          </span>
        </div>

        {/* Center section */}
        <div className="header-center">
          <span className="header-game-name">{gameName}</span>
          <span className="header-separator">·</span>
          <span className="header-player-badge">{playerName}</span>
        </div>

        {/* Right section */}
        <div className="header-right">
          {screenMode === "single" && (
            <div className="panel-toggle-group">
              <button
                className="panel-toggle-btn"
                onClick={() => onSelectPanel("journal")}
                disabled={activePanel === "journal"}
              >
                📔 Journal
              </button>
              <button
                className="panel-toggle-btn"
                onClick={() => onSelectPanel("plots")}
                disabled={activePanel === "plots"}
              >
                📊 Plots
              </button>
            </div>
          )}

          <button className="header-mode-btn" onClick={onToggleMode}>
            {screenMode === "single" ? "🖥️ Dual Screen" : "📱 Single Screen"}
          </button>
        </div>

      </header>
    </>
  );
}

export default GameHeader;