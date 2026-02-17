import { useState } from "react";
import { useTeacherAuth } from "../../hooks/useTeacherAuth";
import { useTeacherSessions } from "../../hooks/useTeacherSessions";
import { Navigate } from "react-router-dom";

function TeacherHomePage() {
  const { user, loading: authLoading, logout } = useTeacherAuth();

  const {
    sessions,
    createSession,
    startSession,
    stopSession,
    getSessionState,
  } = useTeacherSessions();

  const [selectedSession, setSelectedSession] = useState("");

  const [showStartForm, setShowStartForm] = useState(false);
  const [className, setClassName] = useState("");
  const [cadets, setCadets] = useState(0);
  const [sectors, setSectors] = useState(0);

  if (authLoading) return null;
  if (!user) return <Navigate to="/teacher/login" />;

  function handleStartSession() {
    if (!selectedSession) return;

    if (!className || cadets <= 0 || sectors <= 0) {
      alert("Please complete all fields.");
      return;
    }

    startSession(selectedSession, {
      className,
      cadets,
      sectors,
    });

    // reset form
    setShowStartForm(false);
    setClassName("");
    setCadets(0);
    setSectors(0);
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Teacher Control Panel</h1>
      <p>Logged in as {user.email}</p>

      <button onClick={logout}>Logout</button>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Sessions</h2>

      <button onClick={() => createSession("alien-invasion")}>
        ➕ Create New Session
      </button>

      <div style={{ marginTop: "1rem" }}>
        <select
          value={selectedSession}
          onChange={(e) => {
            setSelectedSession(e.target.value);
            setShowStartForm(false);
          }}
        >
          <option value="">Select Session</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} ({getSessionState(s)})
            </option>
          ))}
        </select>
      </div>

      {selectedSession && (
        <div style={{ marginTop: "1.5rem" }}>
          <button onClick={() => setShowStartForm(true)}>
            Start Session
          </button>

          <button
            style={{ marginLeft: "1rem" }}
            onClick={() => stopSession(selectedSession)}
          >
            Stop Session
          </button>

          {showStartForm && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <h3>Session Details</h3>

              <div style={{ marginBottom: "0.5rem" }}>
                <label>Class Name</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <label>Number of Cadets</label>
                <input
                  type="number"
                  value={cadets}
                  onChange={(e) => setCadets(Number(e.target.value))}
                  style={{ marginLeft: "1rem" }}
                />
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                <label>Number of Sectors</label>
                <input
                  type="number"
                  value={sectors}
                  onChange={(e) => setSectors(Number(e.target.value))}
                  style={{ marginLeft: "1rem" }}
                />
              </div>

              <button onClick={handleStartSession}>
                Confirm & Start
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TeacherHomePage;
