import { useState } from "react";
import { useTeacherAuth } from "../../hooks/useTeacherAuth";
import { useTeacherSessions } from "../../hooks/useTeacherSessions";
import { Navigate, useNavigate } from "react-router-dom";
import SessionActivityLog from "./SessionActivityLog";
import SessionRealtimeDashboard from "./SessionRealtimeDashboard";
import JournalSubmissionViewer from "./JournalSubmissionViewer";
import JournalSubmissionChecklist from "./JournalSubmissionChecklist";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .teacher-root {
    min-height: 100vh;
    padding: 0;
    background: #1a1a2e;
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(99, 62, 130, 0.35) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(22, 90, 150, 0.25) 0%, transparent 50%),
      radial-gradient(ellipse at 60% 80%, rgba(180, 80, 120, 0.2) 0%, transparent 50%);
    font-family: 'DM Sans', sans-serif;
    position: relative;
  }

  .teacher-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  /* ── Header bar ── */
  .teacher-header {
    padding: 16px 32px;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .back-btn {
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

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
    color: #f0ece8;
  }

  .header-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: #f0ece8;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .header-user {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    background: rgba(102, 126, 234, 0.12);
    border: 1px solid rgba(102, 126, 234, 0.25);
    border-radius: 100px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(180, 190, 230, 0.8);
  }

  .logout-btn {
    padding: 7px 14px;
    background: rgba(220, 60, 80, 0.15);
    border: 1px solid rgba(220, 60, 80, 0.3);
    border-radius: 100px;
    color: #f08090;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .logout-btn:hover {
    background: rgba(220, 60, 80, 0.22);
    border-color: rgba(220, 60, 80, 0.45);
  }

  /* ── Content container ── */
  .teacher-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 24px;
    position: relative;
    z-index: 1;
  }

  /* ── Section ── */
  .section-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 28px 32px;
    margin-bottom: 24px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.05) inset,
      0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: #f0ece8;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #8b4fcf, #5b6ef5);
    border: none;
    border-radius: 100px;
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 2px 12px rgba(100, 70, 200, 0.3);
  }

  .create-btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(100, 70, 200, 0.4);
  }

  /* ── Form card ── */
  .form-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
    margin-top: 16px;
  }

  .form-title {
    font-size: 16px;
    font-weight: 600;
    color: #f0ece8;
    margin: 0 0 18px;
  }

  .form-field {
    margin-bottom: 16px;
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

  .field-input {
    width: 100%;
    padding: 11px 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 11px;
    color: #f0ece8;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
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

  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .confirm-btn {
    flex: 1;
    padding: 11px 20px;
    background: linear-gradient(135deg, #8b4fcf, #5b6ef5);
    border: none;
    border-radius: 11px;
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: center;
  }

  .confirm-btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  .cancel-btn {
    padding: 11px 20px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 11px;
    color: rgba(200, 185, 220, 0.7);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
  }

  /* ── Session list ── */
  .session-select-wrapper {
    margin-bottom: 16px;
  }

  .session-select {
    width: 100%;
    padding: 11px 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 11px;
    color: #f0ece8;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%23a090c0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 40px;
  }

  .session-select option {
    background: #2e2a45;
    color: #f0ece8;
  }

  .session-select:focus {
    border-color: rgba(160, 110, 230, 0.6);
    background: rgba(255, 255, 255, 0.09);
  }

  .session-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .stop-btn {
    padding: 11px 20px;
    background: rgba(220, 60, 80, 0.15);
    border: 1px solid rgba(220, 60, 80, 0.3);
    border-radius: 11px;
    color: #f08090;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .stop-btn:hover {
    background: rgba(220, 60, 80, 0.22);
    border-color: rgba(220, 60, 80, 0.45);
  }

  .reactivate-btn {
    padding: 11px 20px;
    background: rgba(72, 187, 120, 0.15);
    border: 1px solid rgba(72, 187, 120, 0.3);
    border-radius: 11px;
    color: #70d4a0;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .reactivate-btn:hover {
    background: rgba(72, 187, 120, 0.22);
    border-color: rgba(72, 187, 120, 0.45);
  }

  .copy-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 11px 16px;
    background: rgba(102, 126, 234, 0.12);
    border: 1px solid rgba(102, 126, 234, 0.25);
    border-radius: 11px;
    color: rgba(180, 190, 230, 0.9);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .copy-btn:hover {
    background: rgba(102, 126, 234, 0.18);
    border-color: rgba(102, 126, 234, 0.35);
  }

  .copy-btn:active {
    transform: scale(0.98);
  }

  .activity-log-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.07);
    margin: 32px 0 28px;
  }

  .empty-state {
    text-align: center;
    padding: 32px;
    color: rgba(200, 185, 220, 0.5);
    font-size: 14px;
  }
`;

function TeacherHomePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useTeacherAuth();

  const { sessions, createSession, activateSession, stopSession } = useTeacherSessions();

  const [selectedSession, setSelectedSession] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [className, setClassName] = useState("");
  const [cadets, setCadets] = useState(0);
  const [sectors, setSectors] = useState(0);
  const [slidesLink, setSlidesLink] = useState("");

  if (authLoading) return null;
  if (!user) return <Navigate to="/teacher/login" />;

  async function handleCreateSession() {
    if (!className || cadets <= 0 || sectors <= 0) {
      alert("Please complete all fields.");
      return;
    }

    // Step 1: Create draft session
    const sessionId = await createSession("alien-invasion");
    
    if (sessionId) {
      // Step 2: Immediately activate it with class details
      await activateSession(sessionId, {
        className,
        cadets,
        sectors,
        slidesLink,
      });
      
      // Auto-select the newly created session
      setSelectedSession(sessionId);
    }

    setShowCreateForm(false);
    setClassName("");
    setCadets(0);
    setSectors(0);
    setSlidesLink("");
  }

  function getSessionState(session: any): string {
    return session.status || "draft";
  }

  return (
    <>
      <style>{styles}</style>
      <div className="teacher-root">

        {/* Header */}
        <header className="teacher-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate("/")}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
            <h1 className="header-title">Teacher Control Panel</h1>
          </div>

          <div className="header-user">
            <span className="user-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M2 10c0-2 1.5-3 4-3s4 1 4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {user.email}
            </span>
            <button className="logout-btn" onClick={logout}>Log Out</button>
          </div>
        </header>

        {/* Content */}
        <div className="teacher-content">

          {/* Sessions section */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Sessions</h2>
              <button className="create-btn" onClick={() => setShowCreateForm(true)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                Create New Session
              </button>
            </div>

            {showCreateForm && (
              <div className="form-card">
                <h3 className="form-title">New Session Details</h3>

                <div className="form-field">
                  <label className="field-label">Class Name</label>
                  <input
                    className="field-input"
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g., Period 3 Biology"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Number of Cadets</label>
                  <input
                    className="field-input"
                    type="number"
                    value={cadets || ""}
                    onChange={(e) => setCadets(Number(e.target.value))}
                    placeholder="e.g., 30"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Number of Sectors</label>
                  <input
                    className="field-input"
                    type="number"
                    value={sectors || ""}
                    onChange={(e) => setSectors(Number(e.target.value))}
                    placeholder="e.g., 5"
                  />
                </div>

                {/* Google Slides Link */}
                <div className="form-field">
                  <label className="field-label">Google Slides Link</label>
                  <input
                    className="field-input"
                    type="url"
                    value={slidesLink}
                    onChange={(e) => setSlidesLink(e.target.value)}
                    placeholder="https://docs.google.com/presentation/..."
                  />
                </div>

                <div className="form-actions">
                  <button className="confirm-btn" onClick={handleCreateSession}>
                    Confirm & Create
                  </button>
                  <button className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {sessions.length > 0 ? (
              <>
                <div className="session-select-wrapper">
                  <label className="field-label">Select Active Session</label>
                  <select
                    className="session-select"
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                  >
                    <option value="">— Choose a session —</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} ({getSessionState(s)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSession && (
                  <>
                    <div className="session-actions">
                      {sessions.find(s => s.id === selectedSession)?.status === "inactive" ? (
                        <button 
                          className="reactivate-btn" 
                          onClick={() => {
                            const session = sessions.find(s => s.id === selectedSession);
                            if (session?.start) {
                              activateSession(selectedSession, {
                                className: session.start.class,
                                cadets: session.start.cadets,
                                sectors: session.start.sectors,
                                slidesLink: session.start.slidesLink,
                              });
                            }
                          }}
                        >
                          Reactivate Session
                        </button>
                      ) : (
                        <button className="stop-btn" onClick={() => stopSession(selectedSession)}>
                          Stop Session
                        </button>
                      )}
                      <button 
                        className="copy-btn" 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedSession);
                          const btn = document.activeElement as HTMLButtonElement;
                          const originalText = btn.innerHTML;
                          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> Copied!';
                          setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="4" y="4" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                          <path d="M3 10V3a1 1 0 0 1 1-1h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                        Copy Session ID
                      </button>
                    </div>

                    <div className="activity-log-divider" />
                    
                    <SessionRealtimeDashboard sessionId={selectedSession} />

                    <div className="activity-log-divider" />

                    <JournalSubmissionChecklist sessionId={selectedSession} />

                    <div className="activity-log-divider" />

                    <SessionActivityLog sessionId={selectedSession} />

                    <div className="activity-log-divider" />

                    <JournalSubmissionViewer sessionId={selectedSession} />
                  </>
                )}
              </>
            ) : (
              !showCreateForm && (
                <div className="empty-state">
                  No sessions yet. Click "Create New Session" to get started.
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default TeacherHomePage;