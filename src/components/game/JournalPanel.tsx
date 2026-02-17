/**
 * JournalPanel
 * ------------
 * Container for journal questions and free-response inputs.
 *
 * Responsibilities:
 *   - Display the current round's journal questions
 *   - Collect user-written responses
 *
 * Non-responsibilities:
 *   - Layout decisions (single vs dual)
 *   - Plot rendering
 *   - Persistence (handled elsewhere)
 *
 * This component should remain reusable across
 * single-screen and dual-screen layouts.
 */

import { useState } from "react";
import { JOURNAL_ROUNDS } from "../../config/journal";
import { useGameState } from "../../hooks/useGameState";
import { useLogger } from "../../logging/LoggingProvider";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .journal-root {
    height: 100%;
    padding: 2rem;
    overflow-y: auto;
    background: #fdf8f0;
    background-image:
      radial-gradient(ellipse at 10% 20%, rgba(243, 156, 18, 0.12) 0%, transparent 55%),
      radial-gradient(ellipse at 90% 10%, rgba(230, 126, 34, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 95%, rgba(200, 120, 10, 0.07) 0%, transparent 50%);
    font-family: 'DM Sans', sans-serif;
    position: relative;
  }

  .journal-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c07010' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  /* ── Round tabs ── */
  .round-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
  }

  .round-tab {
    padding: 7px 16px;
    border-radius: 100px;
    border: 1px solid rgba(243, 156, 18, 0.25);
    background: rgba(243, 156, 18, 0.08);
    color: #b07820;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    letter-spacing: 0.02em;
  }

  .round-tab:hover {
    background: rgba(243, 156, 18, 0.18);
    border-color: rgba(243, 156, 18, 0.45);
    color: #8a5c10;
  }

  .round-tab-active {
    background: linear-gradient(135deg, #f39c12, #e67e22);
    border-color: #e67e22;
    color: white;
    box-shadow: 0 2px 12px rgba(243, 156, 18, 0.35);
  }

  /* ── Header ── */
  .journal-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
  }

  .journal-icon {
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, rgba(243, 156, 18, 0.45), rgba(230, 126, 34, 0.45));
    border: 1px solid rgba(243, 156, 18, 0.4);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 4px 16px rgba(243, 156, 18, 0.2);
    flex-shrink: 0;
  }

  .journal-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: #2d1f00;
    margin: 0 0 3px;
    letter-spacing: -0.01em;
  }

  .journal-subtitle {
    font-size: 13px;
    font-weight: 300;
    color: rgba(160, 100, 20, 0.7);
    margin: 0;
    letter-spacing: 0.04em;
  }

  /* ── Info panels ── */
  .tips-panel {
    background: rgba(243, 156, 18, 0.08);
    border: 1px solid rgba(243, 156, 18, 0.2);
    border-radius: 14px;
    padding: 16px 18px;
    margin-bottom: 14px;
    position: relative;
    z-index: 1;
  }

  .tips-panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .tips-panel-title {
    font-size: 13.5px;
    font-weight: 600;
    color: #b07010;
    letter-spacing: 0.02em;
  }

  .tips-list {
    margin: 0;
    padding: 0 0 0 18px;
    color: #7a5010;
    font-size: 13.5px;
    line-height: 1.7;
  }

  .warning-panel {
    background: rgba(220, 60, 80, 0.06);
    border: 1px solid rgba(220, 60, 80, 0.18);
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 24px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    position: relative;
    z-index: 1;
  }

  .warning-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .warning-title {
    font-size: 13px;
    font-weight: 600;
    color: #c0303a;
    margin: 0 0 4px;
  }

  .warning-text {
    font-size: 13px;
    font-weight: 400;
    color: rgba(160, 40, 50, 0.8);
    margin: 0;
    line-height: 1.6;
  }

  /* ── Question cards ── */
  .question-card {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(243, 156, 18, 0.18);
    border-radius: 18px;
    padding: 20px 22px;
    margin-bottom: 14px;
    box-shadow: 0 4px 20px rgba(180, 100, 0, 0.07);
    position: relative;
    z-index: 1;
    transition: border-color 0.2s;
  }

  .question-card:hover {
    border-color: rgba(243, 156, 18, 0.28);
  }

  .question-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;
  }

  .question-number {
    min-width: 30px;
    height: 30px;
    background: linear-gradient(135deg, #f39c12, #e67e22);
    border: none;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 13px;
    flex-shrink: 0;
  }

  .question-prompt {
    font-size: 15px;
    font-weight: 500;
    color: #2d1f00;
    margin: 0;
    line-height: 1.65;
  }

  .question-textarea {
    width: 100%;
    padding: 12px 14px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    color: #2d1f00;
    background: rgba(255, 251, 240, 0.9);
    border: 1px solid rgba(243, 156, 18, 0.25);
    border-radius: 12px;
    resize: vertical;
    min-height: 80px;
    max-height: 260px;
    line-height: 1.6;
    box-sizing: border-box;
    display: block;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }

  .question-textarea::placeholder {
    color: rgba(160, 110, 30, 0.35);
  }

  .question-textarea:focus {
    border-color: rgba(243, 156, 18, 0.55);
    background: #fffdf5;
    box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.12);
  }

  /* ── Save button ── */
  .save-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
    position: relative;
    z-index: 1;
  }

  .save-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #f39c12, #e67e22);
    color: #1a1000;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.02em;
    box-shadow: 0 4px 20px rgba(243, 156, 18, 0.35);
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }

  .save-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
  }

  .save-btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(243, 156, 18, 0.45);
  }

  .save-btn:active {
    transform: translateY(0);
    opacity: 0.8;
  }
`;

function JournalPanel() {
  const { gameState, setJournalAnswer, getJournalAnswersForRound, saveJournalRoundAnswers } = useGameState();
  const logger = useLogger();

  const currentRound = gameState.currentRound;
  const [viewedRound, setViewedRound] = useState(currentRound);
  const roundConfig = JOURNAL_ROUNDS.find((r) => r.roundNumber === viewedRound);

  if (!roundConfig) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "rgba(100, 70, 20, 0.5)", fontSize: "1rem", fontFamily: "'DM Sans', sans-serif" }}>
        No journal questions for this round.
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="journal-root">

        {/* Round navigation tabs */}
        <div className="round-tabs">
          {JOURNAL_ROUNDS.map((r) => (
            <button
              key={r.roundNumber}
              className={`round-tab${viewedRound === r.roundNumber ? " round-tab-active" : ""}`}
              onClick={() => {
                if (viewedRound !== r.roundNumber) {
                  logger.log({
                    type: "journal.round_navigation",
                    action: "round_viewed",
                    userId: gameState.player.name,
                    sessionId: gameState.sessionId,
                    details: { fromRound: viewedRound, toRound: r.roundNumber },
                  });
                  setViewedRound(r.roundNumber);
                }
              }}
            >
              Round {r.roundNumber}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="journal-header">
          <div className="journal-icon">📔</div>
          <div>
            <h2 className="journal-title">Journal</h2>
            <p className="journal-subtitle">Round {viewedRound} Questions</p>
          </div>
        </div>

        {/* Writing tips */}
        <div className="tips-panel">
          <div className="tips-panel-header">
            <span style={{ fontSize: "1rem" }}>💡</span>
            <span className="tips-panel-title">Writing Tips</span>
          </div>
          <ul className="tips-list">
            <li>Use evidence from the data plots to support your answers</li>
            <li>Explain your reasoning clearly</li>
            <li>Think like a scientist — what patterns do you notice?</li>
          </ul>
        </div>

        {/* Save warning */}
        <div className="warning-panel">
          <svg className="warning-icon" width="16" height="16" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6.5" stroke="#c0303a"/>
            <path d="M7 4v3.5" stroke="#c0303a" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="7" cy="10" r="0.75" fill="#c0303a"/>
          </svg>
          <div>
            <p className="warning-title">Save Your Progress</p>
            <p className="warning-text">
              Remember to save regularly. Unsaved progress will be lost if you switch rounds, log out, or close the session.
            </p>
          </div>
        </div>

        {/* Questions */}
        {roundConfig.questions.map((q, index) => {
          const existingAnswer = gameState.rounds[viewedRound]?.journalAnswers[q.id]?.answer ?? "";

          return (
            <div key={q.id} className="question-card">
              <div className="question-header">
                <div className="question-number">{index + 1}</div>
                <p className="question-prompt">{q.prompt}</p>
              </div>

              {q.type === "text" && (
                <textarea
                  className="question-textarea"
                  value={existingAnswer}
                  placeholder="Share your thoughts here…"
                  onChange={(e) =>
                    setJournalAnswer(viewedRound, {
                      questionId: q.id,
                      answer: e.target.value,
                    })
                  }
                />
              )}
            </div>
          );
        })}

        {/* Save button */}
        <div className="save-row">
          <button
            className="save-btn"
            onClick={async () => {
              const answers = getJournalAnswersForRound(viewedRound);
              await saveJournalRoundAnswers(viewedRound);
              logger.log({
                type: "journal.round_submission",
                action: "round_saved",
                userId: gameState.player.name,
                sessionId: gameState.sessionId,
                details: {
                  round: viewedRound,
                  answers: answers.map((a) => ({
                    questionId: a.questionId,
                    answer: a.answer,
                    length: a.answer.length,
                  })),
                  answerCount: answers.length,
                },
              });
            }}
          >
            Save Round {viewedRound} Answers
          </button>
        </div>

      </div>
    </>
  );
}

export default JournalPanel;