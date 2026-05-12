import { useEffect, useState } from "react";
import { useTeacherAuth } from "../../hooks/useTeacherAuth";
import { useTeacherSessions } from "../../hooks/useTeacherSessions";
import { Navigate, useNavigate } from "react-router-dom";
import SessionActivityLog from "./SessionActivityLog";
import SessionRealtimeDashboard from "./SessionRealtimeDashboard";
import JournalSubmissionViewer from "./JournalSubmissionViewer";
import JournalSubmissionChecklist from "./JournalSubmissionChecklist";
import SessionMeetingsTable from "./SessionMeetingsTable";
import SessionInfectionStatusTable from "./SessionInfectionStatusTable";

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
    pointer-events: none;
  }

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

  .teacher-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 24px;
    position: relative;
    z-index: 1;
  }

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

  .template-card,
  .upload-card,
  .roster-manager-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 16px;
  }

  .template-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 14px;
    background: rgba(102, 126, 234, 0.14);
    border: 1px solid rgba(102, 126, 234, 0.3);
    border-radius: 100px;
    color: #c8d0ff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }

  .template-link:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.42);
    transform: translateY(-1px);
  }

  .template-help,
  .upload-help,
  .csv-status,
  .roster-help {
    margin: 10px 0 0;
    color: rgba(220, 210, 235, 0.68);
    font-size: 13px;
    line-height: 1.45;
  }

  .csv-status {
    color: #70d4a0;
    font-weight: 500;
  }

  .file-input {
    width: 100%;
    padding: 11px 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 11px;
    color: rgba(240, 236, 232, 0.85);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    box-sizing: border-box;
  }

  .file-input::file-selector-button {
    margin-right: 12px;
    padding: 8px 13px;
    background: linear-gradient(135deg, #8b4fcf, #5b6ef5);
    border: none;
    border-radius: 100px;
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }

  .field-warning {
    margin: 8px 0 0;
    color: #f5c842;
    font-size: 13px;
    line-height: 1.4;
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

  .meeting-btn {
    padding: 11px 20px;
    border-radius: 11px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .meeting-btn-start {
    background: rgba(160, 110, 230, 0.15);
    border: 1px solid rgba(160, 110, 230, 0.3);
    color: #b08ae0;
  }

  .meeting-btn-start:hover {
    background: rgba(160, 110, 230, 0.22);
    border-color: rgba(160, 110, 230, 0.45);
  }

  .meeting-btn-end {
    background: rgba(243, 156, 18, 0.15);
    border: 1px solid rgba(243, 156, 18, 0.3);
    color: #f5c842;
  }

  .meeting-btn-end:hover {
    background: rgba(243, 156, 18, 0.22);
    border-color: rgba(243, 156, 18, 0.45);
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

  .roster-manager-card {
    margin-bottom: 24px;
  }

  .roster-manager-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .roster-manager-title {
    font-family: 'Playfair Display', serif;
    font-size: 19px;
    font-weight: 700;
    color: #f0ece8;
    margin: 0;
  }

  .roster-count-badge {
    background: rgba(72, 187, 120, 0.15);
    border: 1px solid rgba(72, 187, 120, 0.3);
    border-radius: 100px;
    color: #70d4a0;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .roster-tools {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .roster-add-row {
    display: grid;
    grid-template-columns: minmax(240px, 1fr) 220px auto;
    gap: 12px;
    align-items: center;
  }

  .roster-add-row .field-input {
    min-width: 0;
  }

  .participant-type-select {
    width: 220px;
  }

  @media (max-width: 720px) {
    .roster-add-row {
      grid-template-columns: 1fr;
    }

    .participant-type-select {
      width: 100%;
    }
  }

  .add-student-btn,
  .clear-roster-btn {
    padding: 11px 16px;
    border-radius: 11px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, background 0.2s;
    white-space: nowrap;
  }

  .add-student-btn {
    background: linear-gradient(135deg, #8b4fcf, #5b6ef5);
    border: none;
    color: white;
  }

  .clear-roster-btn {
    background: rgba(220, 60, 80, 0.15);
    border: 1px solid rgba(220, 60, 80, 0.3);
    color: #f08090;
  }

  .add-student-btn:hover,
  .clear-roster-btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  .roster-file-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    align-items: center;
  }

  .roster-list {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .student-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    background: rgba(102, 126, 234, 0.12);
    border: 1px solid rgba(102, 126, 234, 0.25);
    border-radius: 100px;
    color: rgba(220, 225, 255, 0.92);
    font-size: 12px;
    font-weight: 500;
  }

  .remove-student-btn {
    background: none;
    border: none;
    color: rgba(240, 128, 144, 0.95);
    cursor: pointer;
    font-size: 15px;
    line-height: 1;
    padding: 0;
  }

  .participant-row {
    display: grid;
    grid-template-columns: 1fr 160px auto;
    gap: 10px;
    align-items: center;
    width: 100%;
    padding: 8px 10px;
    background: rgba(102, 126, 234, 0.12);
    border: 1px solid rgba(102, 126, 234, 0.25);
    border-radius: 12px;
    color: rgba(220, 225, 255, 0.92);
    font-size: 13px;
    font-weight: 500;
    box-sizing: border-box;
  }

  .participant-row .session-select {
    padding: 8px 10px;
    font-size: 13px;
  }

  .roster-empty {
    margin: 14px 0 0;
    color: rgba(200, 185, 220, 0.5);
    font-size: 13px;
  }
`;

const STUDENT_TEMPLATE_URL =
  "https://docs.google.com/spreadsheets/d/1s0V46jr0vAHJvpc0Yur45_xUVgGgeoDyL7otBYb6Chc/edit?usp=sharing";

type ParticipantType = "player" | "nonPlayerParticipant";

type SessionParticipant = {
  name: string;
  type: ParticipantType;
};

function parseParticipantType(rawType: string | undefined): ParticipantType {
  const normalizedType = rawType?.trim() ?? "";

  if (/^(player|cadet)$/i.test(normalizedType)) {
    return "player";
  }

  return "nonPlayerParticipant";
}

function parseStudentCsv(text: string): SessionParticipant[] {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const [rawName, rawType] = line.split(",");
      const name = rawName?.trim();

      if (!name || name.toLowerCase() === "name") {
        return null;
      }

      return {
        name,
        type: parseParticipantType(rawType),
      };
    })
    .filter((participant): participant is SessionParticipant =>
      participant !== null
    );
}

function getPlayerNames(participants: SessionParticipant[]): string[] {
  return participants
    .filter((participant) => participant.type === "player")
    .map((participant) => participant.name);
}

function getNonPlayerParticipantNames(
  participants: SessionParticipant[]
): string[] {
  return participants
    .filter((participant) => participant.type === "nonPlayerParticipant")
    .map((participant) => participant.name);
}

function TeacherHomePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useTeacherAuth();

  const {
    sessions,
    createSession,
    activateSession,
    setSessionParticipants,
    addSessionPlayer,
    addSessionNonPlayer,
    moveSessionParticipant,
    removeSessionParticipant,
    clearSessionParticipants,
    stopSession,
    startMeeting,
    endMeeting,
  } = useTeacherSessions();

  const [selectedSession, setSelectedSession] = useState("");
  const [playerCountTouched, setPlayerCountTouched] = useState(false);
  const [nonPlayerCountTouched, setNonPlayerCountTouched] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [className, setClassName] = useState("");
  const [uploadedParticipants, setUploadedParticipants] = useState<
    SessionParticipant[]
  >([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [nonPlayerParticipantCount, setNonPlayerParticipantCount] =
    useState(0);
  const [sectors, setSectors] = useState(0);
  const [medBayRooms, setMedBayRooms] = useState(1);
  const [manualParticipantName, setManualParticipantName] = useState("");
  const [manualParticipantType, setManualParticipantType] =
    useState<ParticipantType>("player");
  const [liveParticipants, setLiveParticipants] = useState<
    SessionParticipant[]
  >([]);
  // const [slidesLink, setSlidesLink] = useState("");

  const selectedSessionData = sessions.find(
    (session) => session.id === selectedSession
  );

  useEffect(() => {
    const playerNames = selectedSessionData?.playerNames ?? [];
    const nonPlayerParticipantNames =
      selectedSessionData?.nonPlayerNames ?? [];
    const participants = [
      ...playerNames.map((name) => ({
        name,
        type: "player" as ParticipantType,
      })),
      ...nonPlayerParticipantNames.map((name) => ({
        name,
        type: "nonPlayerParticipant" as ParticipantType,
      })),
    ].sort((left, right) => left.name.localeCompare(right.name));

    setLiveParticipants(participants);
    setManualParticipantName("");
    setManualParticipantType("player");
  }, [selectedSession, selectedSessionData]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/teacher/login" />;

  function handleStudentCsvUpload(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result ?? "");
      const participants = parseStudentCsv(text);

      if (participants.length === 0) {
        alert("No names found in the CSV.");
        return;
      }

      setUploadedParticipants(participants);
      setPlayerCountTouched(false);
      setNonPlayerCountTouched(false);
    };

    reader.readAsText(file);
  }

  function handleReplaceLiveRosterCsv(file: File) {
    const reader = new FileReader();

    reader.onload = async () => {
      const text = String(reader.result ?? "");
      const participants = parseStudentCsv(text);

      if (participants.length === 0) {
        alert("No names found in the CSV.");
        return;
      }

      const shouldReplace = window.confirm(
        `Replace the current name list with ${participants.length} names from this CSV?`
      );

      if (!shouldReplace || !selectedSession) return;

      try {
        await setSessionParticipants(
          selectedSession,
          getPlayerNames(participants),
          getNonPlayerParticipantNames(participants)
        );
        setLiveParticipants(participants);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to replace list.";

        alert(message);
      }
    };

    reader.readAsText(file);
  }

  async function handleAddLiveParticipant() {
    const trimmedName = manualParticipantName.trim();

    if (!selectedSession) {
      alert("Please select a session first.");
      return;
    }

    if (!trimmedName) {
      alert("Please enter a name.");
      return;
    }

    if (
      liveParticipants.some(
        (participant) =>
          participant.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      alert("That name is already in the list.");
      return;
    }

    try {
      if (manualParticipantType === "player") {
        await addSessionPlayer(selectedSession, trimmedName);
      } else {
        await addSessionNonPlayer(selectedSession, trimmedName);
      }

      setLiveParticipants([
        ...liveParticipants,
        { name: trimmedName, type: manualParticipantType },
      ].sort((left, right) => left.name.localeCompare(right.name)));
      setManualParticipantName("");
      setManualParticipantType("player");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add name.";

      alert(message);
    }
  }

  async function handleUpdateParticipantType(
    participantName: string,
    nextType: ParticipantType
  ) {
    if (!selectedSession) {
      alert("Please select a session first.");
      return;
    }

    try {
      await moveSessionParticipant(selectedSession, participantName, nextType);
      setLiveParticipants(
        liveParticipants.map((participant) =>
          participant.name === participantName
            ? { ...participant, type: nextType }
            : participant
        )
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update type.";

      alert(message);
    }
  }

  async function handleRemoveLiveParticipant(participantName: string) {
    if (!selectedSession) {
      alert("Please select a session first.");
      return;
    }

    try {
      await removeSessionParticipant(selectedSession, participantName);
      setLiveParticipants(
        liveParticipants.filter(
          (participant) => participant.name !== participantName
        )
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove name.";

      alert(message);
    }
  }

  async function handleClearLiveRoster() {
    if (!selectedSession) {
      alert("Please select a session first.");
      return;
    }

    const shouldClear = window.confirm(
      "Remove every name from this list?"
    );

    if (!shouldClear) return;

    try {
      await clearSessionParticipants(selectedSession);
      setLiveParticipants([]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to clear list.";

      alert(message);
    }
  }

  async function handleCreateSession() {
    if (
      !sessionName ||
      !className ||
      uploadedParticipants.length === 0 ||
      playerCount < 0 ||
      nonPlayerParticipantCount < 0 ||
      sectors <= 0 ||
      medBayRooms <= 0
    ) {
      alert("Please complete all fields and upload a name list CSV.");
      return;
    }

    const uploadedPlayerCount = getPlayerNames(uploadedParticipants).length;
    const uploadedNonPlayerParticipantCount =
      getNonPlayerParticipantNames(uploadedParticipants).length;

    if (playerCount !== uploadedPlayerCount) {
      alert(
        `Cadet count must match the CSV. You entered ${playerCount}, but the CSV has ${uploadedPlayerCount} cadets.`
      );
      return;
    }

    if (nonPlayerParticipantCount !== uploadedNonPlayerParticipantCount) {
      alert(
        `Bridge Crew count must match the CSV. You entered ${nonPlayerParticipantCount}, but the CSV has ${uploadedNonPlayerParticipantCount} Bridge Crew members.`
      );
      return;
    }

    if (
      playerCount + nonPlayerParticipantCount !==
      uploadedParticipants.length
    ) {
      alert(
        "Cadet count and Bridge Crew count must add up to the total number of names in the CSV."
      );
      return;
    }

    if (!/^[a-zA-Z0-9 _-]+$/.test(sessionName)) {
      alert(
        "Session name can only contain letters, numbers, spaces, hyphens, and underscores."
      );
      return;
    }

    try {
      const sessionId = await createSession("alien-invasion", sessionName);

      if (sessionId) {
        await activateSession(sessionId, {
          className,
          cadets: playerCount,
          sectors,
          medBayRooms,
          // slidesLink,
        });

        await setSessionParticipants(
          sessionId,
          getPlayerNames(uploadedParticipants),
          getNonPlayerParticipantNames(uploadedParticipants)
        );
        setSelectedSession(sessionId);
      }

      setShowCreateForm(false);
      setPlayerCountTouched(false);
      setNonPlayerCountTouched(false);
      setSessionName("");
      setClassName("");
      setUploadedParticipants([]);
      setPlayerCount(0);
      setNonPlayerParticipantCount(0);
      setSectors(0);
      setMedBayRooms(1);
      // setSlidesLink("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create session.";

      alert(message);
    }
  }

  function getSessionState(session: any): string {
    return session.status || "draft";
  }

  return (
    <>
      <style>{styles}</style>
      <div className="teacher-root">
        <header className="teacher-header">
          <div className="header-left">
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
            <h1 className="header-title">Teacher Control Panel</h1>
          </div>

          <div className="header-user">
            <span className="user-badge">{user.email}</span>
            <button className="logout-btn" onClick={logout}>
              Log Out
            </button>
          </div>
        </header>

        <div className="teacher-content">
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Sessions</h2>
              <button
                className="create-btn"
                onClick={() => setShowCreateForm(true)}
              >
                Create New Session
              </button>
            </div>

            {showCreateForm && (
              <div className="form-card">
                <h3 className="form-title">New Session Details</h3>

                <div className="form-field">
                  <label className="field-label">Session Name</label>
                  <input
                    className="field-input"
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g., period3-biology-apr22"
                  />
                </div>

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
                  <label className="field-label">Name List Template</label>
                  <div className="template-card">
                    <a
                      className="template-link"
                      href={STUDENT_TEMPLATE_URL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Google Sheet Template
                    </a>
                    <p className="template-help">
                      Make a copy, add names in the first column, then download
                      as CSV and upload it below.
                    </p>
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Upload Name List CSV</label>
                  <div className="upload-card">
                    <input
                      className="file-input"
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          handleStudentCsvUpload(file);
                        }
                      }}
                    />
                    <p className="upload-help">
                      Upload a CSV with names in the first column. The optional
                      second column is Type. Only "player" saves as a Cadet.
                      Anything else saves as Bridge Crew.
                    </p>

                    {uploadedParticipants.length > 0 && (
                      <p className="csv-status">
                        {uploadedParticipants.length} names loaded from CSV.
                        {" "}
                        {getPlayerNames(uploadedParticipants).length} cadets,
                        {" "}
                        {getNonPlayerParticipantNames(uploadedParticipants)
                          .length}{" "}
                        Bridge Crew members.
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Number of Cadets</label>
                  <input
                    className="field-input"
                    type="number"
                    min="0"
                    step="1"
                    value={playerCount}
                    onChange={(e) =>
                      setPlayerCount(Number(e.target.value))
                    }
                    onBlur={() => setPlayerCountTouched(true)}
                    placeholder="Must match CSV cadet count"
                  />

                  {playerCountTouched &&
                    uploadedParticipants.length > 0 &&
                    playerCount !==
                      getPlayerNames(uploadedParticipants).length && (
                      <p className="field-warning">
                        Cadet count must match the CSV cadet count:{" "}
                        {getPlayerNames(uploadedParticipants).length}.
                      </p>
                    )}
                </div>

                <div className="form-field">
                  <label className="field-label">
                    Number of Bridge Crew
                  </label>
                  <input
                    className="field-input"
                    type="number"
                    min="0"
                    step="1"
                    value={nonPlayerParticipantCount}
                    onChange={(e) =>
                      setNonPlayerParticipantCount(Number(e.target.value))
                    }
                    onBlur={() => setNonPlayerCountTouched(true)}
                    placeholder="Must match CSV Bridge Crew count"
                  />

                  {nonPlayerCountTouched &&
                    uploadedParticipants.length > 0 &&
                    nonPlayerParticipantCount !==
                      getNonPlayerParticipantNames(uploadedParticipants)
                        .length && (
                      <p className="field-warning">
                        Bridge Crew count must match the CSV Bridge Crew count:{" "}
                        {getNonPlayerParticipantNames(uploadedParticipants)
                          .length}.
                      </p>
                    )}
                </div>

                <div className="form-field">
                  <label className="field-label">Number of Sectors</label>
                  <input
                    className="field-input"
                    type="number"
                    min="1"
                    step="1"
                    value={sectors || ""}
                    onChange={(e) => setSectors(Number(e.target.value))}
                    placeholder="e.g., 5"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    Number of MedBay Rooms
                  </label>
                  <input
                    className="field-input"
                    type="number"
                    min="1"
                    step="1"
                    value={medBayRooms || ""}
                    onChange={(e) =>
                      setMedBayRooms(Number(e.target.value))
                    }
                    placeholder="e.g., 1"
                  />
                </div>

                {/*
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
                */}

                <div className="form-actions">
                  <button className="confirm-btn" onClick={handleCreateSession}>
                    Confirm & Create
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowCreateForm(false)}
                  >
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
                    <option value="">Choose a session</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.sessionName} ({getSessionState(s)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSession && (
                  <>
                    <div className="session-actions">
                      {selectedSessionData?.status === "inactive" ? (
                        <button
                          className="reactivate-btn"
                          onClick={() => {
                            const session = sessions.find(
                              (s) => s.id === selectedSession
                            );

                            if (session?.start) {
                              activateSession(selectedSession, {
                                className: session.start.class,
                                cadets: session.start.cadets,
                                sectors: session.start.sectors,
                                medBayRooms:
                                  session.start.medBayRooms ?? 1,
                                // slidesLink: session.start.slidesLink,
                              });
                            }
                          }}
                        >
                          Reactivate Session
                        </button>
                      ) : (
                        <button
                          className="stop-btn"
                          onClick={() => stopSession(selectedSession)}
                        >
                          Stop Session
                        </button>
                      )}

                      {selectedSessionData?.status === "active" && (
                        <button
                          className={`meeting-btn ${
                            selectedSessionData.activeMeeting
                              ? "meeting-btn-end"
                              : "meeting-btn-start"
                          }`}
                          onClick={() =>
                            selectedSessionData.activeMeeting
                              ? endMeeting(selectedSession)
                              : startMeeting(selectedSession)
                          }
                        >
                          {selectedSessionData.activeMeeting
                            ? "End Meeting"
                            : "Start Meeting"}
                        </button>
                      )}

                      <button
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedSession);
                        }}
                      >
                        Copy Session ID
                      </button>
                    </div>

                    <div className="activity-log-divider" />

                    <div className="roster-manager-card">
                      <div className="roster-manager-header">
                        <div>
                          <h3 className="roster-manager-title">
                            Manage Name List
                          </h3>
                          <p className="roster-help">
                            Add, remove, or replace Cadets and Bridge Crew for
                            this session.
                          </p>
                        </div>

                        <span className="roster-count-badge">
                          {getPlayerNames(liveParticipants).length} cadets /{" "}
                          {getNonPlayerParticipantNames(liveParticipants)
                            .length}{" "}
                          Bridge Crew
                        </span>
                      </div>

                      <div className="roster-tools">
                        <div className="roster-add-row">
                          <input
                            className="field-input"
                            type="text"
                            value={manualParticipantName}
                            onChange={(e) =>
                              setManualParticipantName(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddLiveParticipant();
                              }
                            }}
                            placeholder="Type name"
                          />
                          <select
                            className="session-select participant-type-select"
                            value={manualParticipantType}
                            onChange={(e) =>
                              setManualParticipantType(
                                e.target.value as ParticipantType
                              )
                            }
                          >
                            <option value="player">Cadet</option>
                            <option value="nonPlayerParticipant">
                              Bridge Crew
                            </option>
                          </select>
                          <button
                            className="add-student-btn"
                            type="button"
                            onClick={handleAddLiveParticipant}
                          >
                            Add Name
                          </button>
                        </div>

                        <div className="roster-file-row">
                          <input
                            className="file-input"
                            type="file"
                            accept=".csv"
                            onChange={(e) => {
                              const file = e.target.files?.[0];

                              if (file) {
                                handleReplaceLiveRosterCsv(file);
                              }

                              e.target.value = "";
                            }}
                          />

                          <button
                            className="clear-roster-btn"
                            type="button"
                            onClick={handleClearLiveRoster}
                          >
                            Clear Roster
                          </button>
                        </div>

                        <p className="roster-help">
                          Uploading a CSV here replaces the current name list
                          for this selected session.
                        </p>
                      </div>

                      {liveParticipants.length > 0 ? (
                        <div className="roster-list">
                          {liveParticipants.map((participant) => (
                            <div
                              className="participant-row"
                              key={participant.name}
                            >
                              <span>{participant.name}</span>
                              <select
                                className="session-select"
                                value={participant.type}
                                onChange={(e) =>
                                  handleUpdateParticipantType(
                                    participant.name,
                                    e.target.value as ParticipantType
                                  )
                                }
                              >
                                <option value="player">Cadet</option>
                                <option value="nonPlayerParticipant">
                                  Bridge Crew
                                </option>
                              </select>
                              <button
                                className="remove-student-btn"
                                type="button"
                                onClick={() =>
                                  handleRemoveLiveParticipant(participant.name)
                                }
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="roster-empty">
                          No names are currently listed for this session.
                        </p>
                      )}
                    </div>

                    <SessionRealtimeDashboard sessionId={selectedSession} />

                    <div className="activity-log-divider" />
                    <SessionMeetingsTable sessionId={selectedSession} />

                    <div className="activity-log-divider" />
                    <JournalSubmissionChecklist sessionId={selectedSession} />

                    <div className="activity-log-divider" />
                    <SessionActivityLog sessionId={selectedSession} />

                    <div className="activity-log-divider" />
                    <JournalSubmissionViewer sessionId={selectedSession} />

                    <div className="activity-log-divider" />
                    <SessionInfectionStatusTable sessionId={selectedSession} />
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
