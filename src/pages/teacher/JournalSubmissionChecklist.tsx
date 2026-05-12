import { useCallback, useMemo } from "react";
import { useSessionJournalAnswers } from "../../hooks/useSessionJournalAnswers";
import { useSessionParticipants } from "../../hooks/useSessionParticipants";
import type { ParticipantType } from "../../types/gameState";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

  .checklist-root {
    margin-top: 32px;
    font-family: 'DM Sans', sans-serif;
  }

  .checklist-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .checklist-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .checklist-title {
    font-size: 18px;
    font-weight: 600;
    color: #f0ece8;
    margin: 0;
  }

  .checklist-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(243, 156, 18, 0.15);
    border: 1px solid rgba(243, 156, 18, 0.3);
    border-radius: 100px;
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 500;
    color: #f5c842;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .checklist-badge-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #f5c842;
    box-shadow: 0 0 4px #f5c842;
  }

  .checklist-card {
    background: rgba(243, 156, 18, 0.06);
    border: 1px solid rgba(243, 156, 18, 0.15);
    border-radius: 16px;
    padding: 18px;
  }

  .checklist-summary {
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

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 520px;
  }

  thead th {
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(200, 185, 220, 0.7);
    padding: 12px 12px;
    border-bottom: 1px solid rgba(243, 156, 18, 0.12);
    white-space: nowrap;
  }

  tbody td {
    padding: 12px 12px;
    border-bottom: 1px solid rgba(243, 156, 18, 0.08);
    color: rgba(240, 236, 232, 0.9);
    font-size: 13px;
    white-space: nowrap;
  }

  tbody tr:hover td {
    background: rgba(255, 255, 255, 0.03);
  }

  .status-cell {
    font-weight: 600;
  }

  .status-yes {
    color: #70d4a0;
  }

  .status-no {
    color: rgba(200, 185, 220, 0.45);
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

function JournalSubmissionChecklist({ sessionId }: Props) {
  const { participants } = useSessionParticipants(sessionId);
  const { answersMap: journalAnswersMap } = useSessionJournalAnswers(sessionId);
  const { answersMap: bridgeCrewAnswersMap } = useSessionJournalAnswers(
    sessionId,
    "bridgeCrewLogAnswers"
  );

  const participantRows = useMemo(() => {
    return participants
      .map((participant) => ({
        id: participant.id,
        type: participant.type,
      }))
      .sort((left, right) => {
        if (left.type !== right.type) {
          return left.type === "player" ? -1 : 1;
        }

        return left.id.localeCompare(right.id);
      });
  }, [participants]);

  const getAnswersMap = useCallback(
    (type: ParticipantType) =>
      type === "player" ? journalAnswersMap : bridgeCrewAnswersMap,
    [journalAnswersMap, bridgeCrewAnswersMap]
  );

  const hasRoundSubmission = useCallback(
    (
      participantId: string,
      participantType: ParticipantType,
      round: 1 | 2 | 3
    ): boolean => {
      return Boolean(getAnswersMap(participantType)?.[participantId]?.[round]);
    },
    [getAnswersMap]
  );

  const totals = useMemo(() => {
    const totalParticipants = participantRows.length;

    const r1 = participantRows.filter((participant) =>
      hasRoundSubmission(participant.id, participant.type, 1)
    ).length;
    const r2 = participantRows.filter((participant) =>
      hasRoundSubmission(participant.id, participant.type, 2)
    ).length;
    const r3 = participantRows.filter((participant) =>
      hasRoundSubmission(participant.id, participant.type, 3)
    ).length;

    return { totalParticipants, r1, r2, r3 };
  }, [participantRows, hasRoundSubmission]);

  if (participantRows.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="checklist-root">
          <div className="checklist-header">
            <div className="checklist-title-wrap">
              <h3 className="checklist-title">Round Log Submission Checklist</h3>
            </div>
          </div>
          <div className="checklist-card">
            <div className="empty-state">
              No participants found yet. This checklist will populate once the
              roster is ready.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="checklist-root">
        <div className="checklist-header">
          <div className="checklist-title-wrap">
            <h3 className="checklist-title">Round Log Submission Checklist</h3>
            <span className="checklist-badge">
              <span className="checklist-badge-dot" />
              Live
            </span>
          </div>
        </div>

        <div className="checklist-card">
          <div className="checklist-summary">
            <div className="summary-pill">
              {totals.totalParticipants} <span>participants</span>
            </div>
            <div className="summary-pill">
              {totals.r1}/{totals.totalParticipants} <span>Round 1</span>
            </div>
            <div className="summary-pill">
              {totals.r2}/{totals.totalParticipants} <span>Round 2</span>
            </div>
            <div className="summary-pill">
              {totals.r3}/{totals.totalParticipants} <span>Round 3</span>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Type</th>
                  <th>Round 1</th>
                  <th>Round 2</th>
                  <th>Round 3</th>
                </tr>
              </thead>
              <tbody>
                {participantRows.map((participant) => {
                  const r1 = hasRoundSubmission(
                    participant.id,
                    participant.type,
                    1
                  );
                  const r2 = hasRoundSubmission(
                    participant.id,
                    participant.type,
                    2
                  );
                  const r3 = hasRoundSubmission(
                    participant.id,
                    participant.type,
                    3
                  );

                  return (
                    <tr key={`${participant.type}-${participant.id}`}>
                      <td>{participant.id}</td>
                      <td>
                        {participant.type === "player"
                          ? "Cadet"
                          : "Bridge Crew"}
                      </td>
                      <td className="status-cell">
                        {r1 ? (
                          <span className="status-yes">✅ Submitted</span>
                        ) : (
                          <span className="status-no">—</span>
                        )}
                      </td>
                      <td className="status-cell">
                        {r2 ? (
                          <span className="status-yes">✅ Submitted</span>
                        ) : (
                          <span className="status-no">—</span>
                        )}
                      </td>
                      <td className="status-cell">
                        {r3 ? (
                          <span className="status-yes">✅ Submitted</span>
                        ) : (
                          <span className="status-no">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default JournalSubmissionChecklist;
