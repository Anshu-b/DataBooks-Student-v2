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

import { JOURNAL_ROUNDS } from "../../config/journal";
import { useGameState } from "../../hooks/useGameState";

function JournalPanel() {
  const { gameState, setJournalAnswer } = useGameState();
  const currentRound = gameState.currentRound;

  const roundConfig = JOURNAL_ROUNDS.find(
    (r) => r.roundNumber === currentRound
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
        minHeight: "100vh",
      }}
    >
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
            Journal Questions
          </h2>
          <div
            style={{
              fontSize: "0.95rem",
              color: "#718096",
              fontWeight: 500,
              marginTop: "0.25rem",
            }}
          >
            Round {currentRound} Reflections
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {roundConfig.questions.map((q, index) => (
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
                  fontSize: "1.05rem",
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
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1rem",
                  color: "#2d3748",
                  background: "#fef9f3",
                  border: "2px solid #fdebd0",
                  borderRadius: "12px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  minHeight: "120px",
                  transition: "all 0.3s ease",
                  outline: "none",
                  lineHeight: "1.6",
                  boxSizing: "border-box",
                }}
                placeholder="Share your thoughts here..."
                onChange={(e) =>
                  setJournalAnswer(currentRound, {
                    questionId: q.id,
                    answer: e.target.value,
                  })
                }
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f39c12";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(243, 156, 18, 0.1)";
                  e.currentTarget.style.background = "white";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#fdebd0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fef9f3";
                }}
              />
            )}

            {/* Plot Required Notice */}
            {q.type === "plot-required" && (
              <div
                style={{
                  background: "rgba(102, 126, 234, 0.1)",
                  border: "2px solid rgba(102, 126, 234, 0.2)",
                  borderRadius: "12px",
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>📊</span>
                <em
                  style={{
                    color: "#4a5568",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                >
                  Explore the DataPlots tab first, then come back to answer this
                  question!
                </em>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Helpful Tips Section */}
      <div
        style={{
          maxWidth: "700px",
          margin: "2rem auto 0",
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
          <strong style={{ color: "#2d3748", fontSize: "0.95rem" }}>
            Writing Tips
          </strong>
        </div>
        <ul
          style={{
            margin: "0.5rem 0 0 1.5rem",
            padding: 0,
            color: "#4a5568",
            fontSize: "0.9rem",
            lineHeight: "1.6",
          }}
        >
          <li>Use evidence from the data plots to support your answers</li>
          <li>Explain your reasoning clearly</li>
          <li>Think like a scientist - what patterns do you notice?</li>
        </ul>
      </div>
    </div>
  );
}

export default JournalPanel;