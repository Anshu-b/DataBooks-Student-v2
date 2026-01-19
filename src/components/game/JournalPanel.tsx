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


function JournalPanel() {
  const { gameState, setJournalAnswer, getJournalAnswersForRound, saveJournalRoundAnswers} = useGameState();
  const logger = useLogger();

  const currentRound = gameState.currentRound;


  /* -----------------------------------------
   * NEW: viewed round (allows jumping around)
   * ----------------------------------------- */
  const [viewedRound, setViewedRound] = useState(currentRound);
  const roundConfig = JOURNAL_ROUNDS.find(
    (r) => r.roundNumber === viewedRound
  );


  if (!roundConfig) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "#718096",
          fontSize: "1.1rem",
        }}
      >
        <p>No journal questions for this round.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        overflowY: "auto",
        background: "linear-gradient(135deg, #fef5e7 0%, #fdebd0 100%)",
      }}
    >
      {/* -----------------------------------------
       * NEW: Round Navigation Tabs
       * ----------------------------------------- */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {JOURNAL_ROUNDS.map((r) => (
          <button
            key={r.roundNumber}
            onClick={() => {
              if (viewedRound !== r.roundNumber) {
                logger.log({
                  type: "journal.round_navigation",
                  action: "round_viewed",
                  userId: gameState.player.name,
                  sessionId: gameState.sessionId,
                  details: {
                    fromRound: viewedRound,
                    toRound: r.roundNumber,
                  },
                });
                setViewedRound(r.roundNumber);
              }
            }}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              background:
                viewedRound === r.roundNumber
                  ? "#f39c12"
                  : "rgba(243, 156, 18, 0.2)",
              color:
                viewedRound === r.roundNumber ? "white" : "#2d3748",
            }}
          >
            Round {r.roundNumber}
          </button>
        ))}
      </div>

      {/* Header */}
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, #f39c12, #e67e22)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            boxShadow: "0 4px 12px rgba(243, 156, 18, 0.3)",
          }}
        >
          📔
        </div>
        <div>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "#2d3748",
              margin: 0,
            }}
          >
            Journal
          </h2>
          <div
            style={{
              fontSize: "0.95rem",
              color: "#718096",
              fontWeight: 500,
              marginTop: "0.25rem",
            }}
          >
            Round {viewedRound} Questions
          </div>
        </div>
      </div>

      {/* Helpful Tips Section */}
      <div
        style={{
          maxWidth: "900px",
          margin: "2rem auto 2rem",
          background: "rgba(243, 156, 18, 0.1)",
          borderRadius: "12px",
          padding: "1.25rem",
          border: "2px solid rgba(243, 156, 18, 0.2)",
        }}
      >
        
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>💡</span>
          <strong style={{ color: "#2d3748", fontSize: "1.25rem" }}>
            Writing Tips
          </strong>
        </div>
        <ul
          style={{
            margin: "0.5rem 0 0 1.5rem",
            padding: 0,
            color: "#4a5568",
            fontSize: "1.1rem",
            lineHeight: "1.6",
          }}
        >
          <li>Use evidence from the data plots to support your answers</li>
          <li>Explain your reasoning clearly</li>
          <li>Think like a scientist - what patterns do you notice?</li>
        </ul>
      </div>

        {/* Saving Answers Warning Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "1rem",
          padding: "1rem",
          backgroundColor: "#fff5f5", // Light red background
          border: "1px solid #feb2b2", // Subtle red border
          borderRadius: "0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <strong style={{ color: "#c53030", fontSize: "1.25rem" }}>
            Important: Save Your Progress
          </strong>
        </div>
        
        <p
          style={{
            margin: 0,
            color: "#9b2c2c", // Darker red for readability
            fontSize: "1.1rem",
            fontWeight: "bold", // Bold as requested
            lineHeight: "1.6",
          }}
        >
          Please remember to save or submit your answers regularly. Any unsaved 
          progress will be lost once you log out, switch between rounds, or close the session.
        </p>
      </div>
      

      {/* Questions */}
      {roundConfig.questions.map((q, index) => {
        const existingAnswer =
          gameState.rounds[viewedRound]?.journalAnswers[q.id]?.answer ?? "";

        return (
          <div
            key={q.id}
            style={{
              marginBottom: "1.5rem",
              background: "white",
              borderRadius: "16px",
              padding: "1.5rem",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              border: "2px solid rgba(243, 156, 18, 0.1)",
            }}
          >
            {/* Question Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  minWidth: "32px",
                  height: "32px",
                  background: "linear-gradient(135deg, #f39c12, #e67e22)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {index + 1}
              </div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: "1.25rem",
                  color: "#2d3748",
                  margin: 0,
                  lineHeight: "1.6",
                }}
              >
                {q.prompt}
              </p>
            </div>

            {/* Text Input */}
            {q.type === "text" && (
              <textarea
              value={existingAnswer}
              placeholder="Share your thoughts here..."
              style={{
                width: "100%",
                padding: "0.75rem 0.9rem",
                fontSize: "1rem",
                color: "#2d3748",
                background: "#fffdf9",
                border: "2px solid #fde2c4",
                borderRadius: "10px",
                fontFamily: "inherit",
                resize: "vertical",
            
                /* 🔧 FIXES */
                minHeight: "72px",
                maxHeight: "260px",
                lineHeight: "1.5",
                boxSizing: "border-box",
                display: "block",
              }}
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

    {/*  Save / Submit Button*/}
      <div
        style={{
          margin: "2rem auto",
          textAlign: "right",
        }}
      >
        <button
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
          style={{
            padding: "0.75rem 1.5rem",
            background: "#f39c12",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "1rem",
            transition: "transform 0.1s, opacity 0.1s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          onMouseDown={(e) => e.currentTarget.style.opacity = "0.7"}
          onMouseUp={(e) => e.currentTarget.style.opacity = "1"}
        >
          Save Round {viewedRound} Answers
        </button>

      </div>
    </div>
  );
}

export default JournalPanel;
