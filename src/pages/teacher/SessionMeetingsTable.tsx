import { useEffect, useMemo, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

  .meetings-root {
    margin-top: 0;
    font-family: 'DM Sans', sans-serif;
  }

  .meetings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .meetings-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .meetings-title {
    font-size: 18px;
    font-weight: 600;
    color: #f0ece8;
    margin: 0;
  }

  .meetings-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(160, 110, 230, 0.15);
    border: 1px solid rgba(160, 110, 230, 0.3);
    border-radius: 100px;
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 500;
    color: #b08ae0;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .meetings-badge-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #b08ae0;
    box-shadow: 0 0 4px #b08ae0;
  }

  .meetings-card {
    background: rgba(160, 110, 230, 0.06);
    border: 1px solid rgba(160, 110, 230, 0.15);
    border-radius: 16px;
    padding: 18px;
  }

  .meetings-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 14px;
  }

  .summary-pill {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    padding: 6px 10px;
    color: rgba(240, 236, 232, 0.85);
    font-size: 12px;
    font-weight: 500;
  }

  .summary-pill span {
    color: rgba(200, 185, 220, 0.6);
    font-weight: 400;
  }

  .table-wrap {
    overflow-x: auto;
    border-radius: 12px;
  }

  .meetings-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 620px;
  }

  .meetings-table thead th {
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(200, 185, 220, 0.7);
    padding: 12px 12px;
    border-bottom: 1px solid rgba(160, 110, 230, 0.12);
    white-space: nowrap;
  }

  .meetings-table tbody td {
    padding: 12px 12px;
    border-bottom: 1px solid rgba(160, 110, 230, 0.08);
    color: rgba(240, 236, 232, 0.9);
    font-size: 13px;
    white-space: nowrap;
  }

  .meetings-table tbody tr:hover td {
    background: rgba(255, 255, 255, 0.03);
  }

  .meeting-id {
    font-weight: 600;
    color: #d6c2ff;
  }

  .meeting-status {
    font-weight: 600;
  }

  .meeting-status-active {
    color: #f5c842;
  }

  .meeting-status-ended {
    color: #70d4a0;
  }

  .time-cell {
    font-variant-numeric: tabular-nums;
    color: rgba(220, 210, 235, 0.82);
  }

  .empty-state {
    text-align: center;
    padding: 28px 16px;
    color: rgba(200, 185, 220, 0.45);
    font-size: 14px;
  }
`;

interface Props {
  sessionId: string;
}

type MeetingRecord = {
  id: string;
  startTime?: string;
  endTime?: string;
};

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) {
    return "In progress";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Invalid time";
  }

  return date.toLocaleString();
}

function SessionMeetingsTable({ sessionId }: Props) {
  const db = getDatabase();
  const [meetings, setMeetings] = useState<Record<string, Omit<MeetingRecord, "id">>>({});

  useEffect(() => {
    if (!sessionId) return;

    const meetingsRef = ref(db, `sessions/${sessionId}/meetings`);
    const unsubscribe = onValue(meetingsRef, (snapshot) => {
      setMeetings(snapshot.val() ?? {});
    });

    return () => unsubscribe();
  }, [db, sessionId]);

  const meetingRows = useMemo(() => {
    return Object.entries(meetings)
      .map(([id, meeting]) => ({
        id,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
      }))
      .sort((leftMeeting, rightMeeting) => {
        const leftMs = leftMeeting.startTime ? Date.parse(leftMeeting.startTime) : 0;
        const rightMs = rightMeeting.startTime ? Date.parse(rightMeeting.startTime) : 0;
        return rightMs - leftMs;
      });
  }, [meetings]);

  const activeMeetingsCount = meetingRows.filter((meeting) => !meeting.endTime).length;

  return (
    <>
      <style>{styles}</style>
      <div className="meetings-root">
        <div className="meetings-header">
          <div className="meetings-title-wrap">
            <h3 className="meetings-title">Meeting Timeline</h3>
            <span className="meetings-badge">
              <span className="meetings-badge-dot" />
              Live
            </span>
          </div>
        </div>

        <div className="meetings-card">
          <div className="meetings-summary">
            <div className="summary-pill">
              {meetingRows.length} <span>meetings</span>
            </div>
            <div className="summary-pill">
              {activeMeetingsCount} <span>active</span>
            </div>
          </div>

          {meetingRows.length === 0 ? (
            <div className="empty-state">
              No meetings recorded yet. Start a meeting from the control bar to populate this table.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="meetings-table">
                <thead>
                  <tr>
                    <th>Meeting</th>
                    <th>Status</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {meetingRows.map((meeting) => {
                    const isActive = !meeting.endTime;

                    return (
                      <tr key={meeting.id}>
                        <td className="meeting-id">{meeting.id}</td>
                        <td className={`meeting-status ${isActive ? "meeting-status-active" : "meeting-status-ended"}`}>
                          {isActive ? "Active" : "Ended"}
                        </td>
                        <td className="time-cell">{formatTimestamp(meeting.startTime)}</td>
                        <td className="time-cell">{formatTimestamp(meeting.endTime)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SessionMeetingsTable;
