import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

  .journal-viewer-root {
    margin-top: 32px;
    font-family: 'DM Sans', sans-serif;
  }

  .journal-viewer-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .journal-viewer-title {
    font-size: 18px;
    font-weight: 600;
    color: #f0ece8;
    margin: 0;
  }

  .live-badge {
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

  .live-badge-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #f5c842;
    box-shadow: 0 0 4px #f5c842;
  }

  .journal-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    align-items: center;
    flex-wrap: wrap;
  }

  .round-select-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .round-select-label {
    font-size: 12px;
    font-weight: 500;
    color: rgba(200, 185, 220, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .round-select {
    padding: 8px 32px 8px 12px;
    background: rgba(243, 156, 18, 0.12);
    border: 1px solid rgba(243, 156, 18, 0.25);
    border-radius: 100px;
    color: #f5c842;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    transition: background 0.2s, border-color 0.2s;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%23f5c842' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
  }

  .round-select option {
    background: #2e2a45;
    color: #f5c842;
  }

  .round-select:hover {
    background: rgba(243, 156, 18, 0.18);
    border-color: rgba(243, 156, 18, 0.35);
  }

  .student-nav {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    padding: 4px;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: rgba(200, 185, 220, 0.7);
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }

  .nav-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    color: #f0ece8;
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .student-info {
    padding: 0 12px;
    font-size: 13px;
    font-weight: 500;
    color: #f0ece8;
    white-space: nowrap;
  }

  .student-count {
    color: rgba(200, 185, 220, 0.5);
    font-weight: 400;
  }

  .answers-card {
    background: rgba(243, 156, 18, 0.06);
    border: 1px solid rgba(243, 156, 18, 0.15);
    border-radius: 16px;
    padding: 24px;
  }

  .answer-item {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(243, 156, 18, 0.1);
  }

  .answer-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .question-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .question-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #f39c12, #e67e22);
    border-radius: 6px;
    color: white;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .question-id {
    font-size: 13px;
    font-weight: 600;
    color: rgba(243, 200, 120, 0.9);
    letter-spacing: 0.02em;
  }

  .answer-text {
    padding: 12px 16px;
    background: rgba(255, 251, 240, 0.08);
    border: 1px solid rgba(243, 156, 18, 0.12);
    border-radius: 10px;
    color: rgba(240, 220, 180, 0.95);
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .empty-answer {
    font-style: italic;
    color: rgba(200, 185, 220, 0.4);
  }

  .empty-state {
    text-align: center;
    padding: 48px 24px;
    color: rgba(200, 185, 220, 0.4);
    font-size: 14px;
  }

  .empty-state-icon {
    font-size: 32px;
    margin-bottom: 12px;
    opacity: 0.3;
  }
`;

interface Props {
  sessionId: string;
}

interface StudentAnswers {
  [questionId: string]: {
    answer: string;
    updatedAt: number;
  };
}

function JournalSubmissionViewer({ sessionId }: Props) {
  const db = getDatabase();

  const [students, setStudents] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, Record<number, StudentAnswers>>>({});
  const [availableRounds, setAvailableRounds] = useState<number[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!sessionId) return;

    const answersRef = ref(db, `sessions/${sessionId}/journalAnswers`);

    const unsub = onValue(answersRef, (snapshot) => {
      const data = snapshot.val() ?? {};

      const studentList = Object.keys(data);
      setStudents(studentList);

      const roundSet = new Set<number>();
      const structured: Record<string, Record<number, StudentAnswers>> = {};

      studentList.forEach((student) => {
        structured[student] = {};

        Object.keys(data[student]).forEach((roundKey) => {
          const roundNumber = Number(roundKey);
          roundSet.add(roundNumber);
          structured[student][roundNumber] = data[student][roundKey];
        });
      });

      const sortedRounds = Array.from(roundSet).sort((a, b) => a - b);
      setAvailableRounds(sortedRounds);

      // auto-select latest round if none selected
      if (!selectedRound && sortedRounds.length > 0) {
        setSelectedRound(sortedRounds[sortedRounds.length - 1]);
      }

      setAnswers(structured);
    });

    return () => unsub();
  }, [sessionId, selectedRound, db]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedRound]);

  if (availableRounds.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="journal-viewer-root">
          <div className="journal-viewer-header">
            <h3 className="journal-viewer-title">Live Journal Review</h3>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div>No journal submissions yet. Students' answers will appear here once they save their work.</div>
          </div>
        </div>
      </>
    );
  }

  if (!selectedRound) {
    return null;
  }

  // Filter students who submitted this round
  const studentsForRound = students.filter((s) => answers[s]?.[selectedRound]);

  const currentStudent = studentsForRound[currentIndex];
  const currentAnswers = answers[currentStudent]?.[selectedRound] ?? {};

  function nextStudent() {
    setCurrentIndex((prev) => (prev < studentsForRound.length - 1 ? prev + 1 : prev));
  }

  function prevStudent() {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }

  return (
    <>
      <style>{styles}</style>
      <div className="journal-viewer-root">
        
        <div className="journal-viewer-header">
          <h3 className="journal-viewer-title">Live Journal Review</h3>
          <span className="live-badge">
            <span className="live-badge-dot" />
            Live
          </span>
        </div>

        <div className="journal-controls">
          {/* Round Selector */}
          <div className="round-select-wrapper">
            <label className="round-select-label">Round</label>
            <select
              className="round-select"
              value={selectedRound}
              onChange={(e) => setSelectedRound(Number(e.target.value))}
            >
              {availableRounds.map((round) => (
                <option key={round} value={round}>
                  Round {round}
                </option>
              ))}
            </select>
          </div>

            {/* Student Selector */}
            {studentsForRound.length > 0 && (
            <div className="student-selector">
                <label className="round-select-label">
                Student
                </label>

                <select
                className="round-select"
                value={currentStudent}
                onChange={(e) => {
                    const newIndex = studentsForRound.findIndex(
                    (s) => s === e.target.value
                    );
                    setCurrentIndex(newIndex);
                }}
                >
                {studentsForRound.map((student, index) => (
                    <option key={student} value={student}>
                    {student} ({index + 1}/{studentsForRound.length})
                    </option>
                ))}
                </select>
            </div>
            )}
        </div>

        {/* Answers */}
        {studentsForRound.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div>No submissions for Round {selectedRound} yet.</div>
          </div>
        ) : (
          <div className="answers-card">
            {Object.entries(currentAnswers).length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div>{currentStudent} hasn't submitted any answers for this round yet.</div>
              </div>
            ) : (
              Object.entries(currentAnswers)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([questionId, data], index) => (
                  <div key={questionId} className="answer-item">
                    <div className="question-label">
                      <span className="question-number">{index + 1}</span>
                      <span className="question-id">{questionId}</span>
                    </div>
                    <div className="answer-text">
                      {data.answer || <span className="empty-answer">(No answer provided)</span>}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

      </div>
    </>
  );
}

export default JournalSubmissionViewer;