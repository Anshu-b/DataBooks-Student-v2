import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

  .dashboard-root {
    margin-top: 32px;
    font-family: 'DM Sans', sans-serif;
  }

  .dashboard-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .dashboard-title {
    font-size: 18px;
    font-weight: 600;
    color: #f0ece8;
    margin: 0;
  }

  .metrics-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(72, 187, 120, 0.15);
    border: 1px solid rgba(72, 187, 120, 0.3);
    border-radius: 100px;
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 500;
    color: #70d4a0;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .metrics-badge-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #70d4a0;
    box-shadow: 0 0 4px #70d4a0;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
  }

  .metric-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 20px;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }

  .metric-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
    pointer-events: none;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .metric-card-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    font-size: 18px;
    margin-bottom: 12px;
  }

  .metric-card-players .metric-card-icon {
    background: rgba(91, 110, 245, 0.2);
    border: 1px solid rgba(91, 110, 245, 0.3);
  }

  .metric-card-infected .metric-card-icon {
    background: rgba(220, 60, 80, 0.2);
    border: 1px solid rgba(220, 60, 80, 0.3);
  }

  .metric-card-healthy .metric-card-icon {
    background: rgba(72, 187, 120, 0.2);
    border: 1px solid rgba(72, 187, 120, 0.3);
  }

  .metric-card-journal .metric-card-icon {
    background: rgba(243, 156, 18, 0.2);
    border: 1px solid rgba(243, 156, 18, 0.3);
  }

  .metric-card-meetings .metric-card-icon {
    background: rgba(160, 110, 230, 0.2);
    border: 1px solid rgba(160, 110, 230, 0.3);
  }

  .metric-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(200, 185, 220, 0.6);
    margin-bottom: 8px;
  }

  .metric-value {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    color: #f0ece8;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .metric-card-players .metric-value {
    color: #8ba5f5;
  }

  .metric-card-infected .metric-value {
    color: #f08090;
  }

  .metric-card-healthy .metric-value {
    color: #70d4a0;
  }

  .metric-card-journal .metric-value {
    color: #f5c842;
  }

  .metric-card-meetings .metric-value {
    color: #b08ae0;
  }

  .loading-shimmer {
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

interface Props {
  sessionId: string;
}

interface LiveStats {
  totalPlayers: number;
  infectedCount: number;
  healthyCount: number;
  journalSubmissions: number;
  meetingCount: number;
}

function SessionRealtimeDashboard({ sessionId }: Props) {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const db = getDatabase();

  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = ref(db, `sessions/${sessionId}`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const players = data.players ?? {};
      const journalAnswers = data.journalAnswers ?? {};
      const meetings = data.meetings ?? {};

      const playerList = Object.values(players);
      const totalPlayers = playerList.length;

      const infectedCount = playerList.filter(
        (p: any) => p.infection_status === 1
      ).length;

      const healthyCount = totalPlayers - infectedCount;
      const journalSubmissions = Object.keys(journalAnswers).length;
      const meetingCount = Object.keys(meetings).length;

      setStats({
        totalPlayers,
        infectedCount,
        healthyCount,
        journalSubmissions,
        meetingCount,
      });
    });

    return () => unsubscribe();
  }, [sessionId, db]);

  if (!stats) {
    return (
      <>
        <style>{styles}</style>
        <div className="dashboard-root">
          <div className="dashboard-header">
            <h3 className="dashboard-title">Live Session Metrics</h3>
          </div>
          <div className="metrics-grid">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="metric-card loading-shimmer">
                <div className="metric-card-icon">⏳</div>
                <div className="metric-label">Loading...</div>
                <div className="metric-value">—</div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-root">
        
        <div className="dashboard-header">
          <h3 className="dashboard-title">Live Session Metrics</h3>
          <span className="metrics-badge">
            <span className="metrics-badge-dot" />
            Live
          </span>
        </div>

        <div className="metrics-grid">
          <div className="metric-card metric-card-players">
            <div className="metric-card-icon">👥</div>
            <div className="metric-label">Total Players</div>
            <div className="metric-value">{stats.totalPlayers}</div>
          </div>

          <div className="metric-card metric-card-infected">
            <div className="metric-card-icon">🦠</div>
            <div className="metric-label">Infected Players</div>
            <div className="metric-value">{stats.infectedCount}</div>
          </div>

          <div className="metric-card metric-card-healthy">
            <div className="metric-card-icon">✅</div>
            <div className="metric-label">Healthy Players</div>
            <div className="metric-value">{stats.healthyCount}</div>
          </div>

          <div className="metric-card metric-card-journal">
            <div className="metric-card-icon">📝</div>
            <div className="metric-label">Journal Submissions</div>
            <div className="metric-value">{stats.journalSubmissions}</div>
          </div>

          <div className="metric-card metric-card-meetings">
            <div className="metric-card-icon">🤝</div>
            <div className="metric-label">Meetings</div>
            <div className="metric-value">{stats.meetingCount}</div>
          </div>
        </div>

      </div>
    </>
  );
}

export default SessionRealtimeDashboard;