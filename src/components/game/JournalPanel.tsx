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
    return <p>No journal questions for this round.</p>;
  }

  return (
    <div style={{ padding: "2rem", overflowY: "auto" }}>
      <h2>Journal – Round {currentRound}</h2>

      {roundConfig.questions.map((q) => (
        <div key={q.id} style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontWeight: 500 }}>{q.prompt}</p>

          {q.type === "text" && (
            <input
              style={{ width: "100%", padding: "0.6rem" }}
              placeholder="Your answer..."
              onChange={(e) =>
                setJournalAnswer(currentRound, {
                  questionId: q.id,
                  answer: e.target.value,
                })
              }
            />
          )}

          {q.type === "plot-required" && (
            <em style={{ color: "#666" }}>
              Answer this after exploring the DataPlots tab.
            </em>
          )}
        </div>
      ))}
    </div>
  );
}

export default JournalPanel;


  