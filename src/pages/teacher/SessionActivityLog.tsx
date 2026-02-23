import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

  .activity-log-root {
    margin-top: 0;
    font-family: 'DM Sans', sans-serif;
  }

  .activity-log-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .activity-log-title {
    font-size: 18px;
    font-weight: 600;
    color: #f0ece8;
    margin: 0;
  }

  .activity-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(72, 187, 120, 0.15);
    border: 1px solid rgba(72, 187, 120, 0.3);
    border-radius: 100px;
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 500;
    color: #70d4a0;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .activity-badge-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #70d4a0;
    box-shadow: 0 0 4px #70d4a0;
  }

  .activity-table-wrapper {
    max-height: 500px;
    overflow-y: auto;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 0;
  }

  .activity-table-wrapper::-webkit-scrollbar {
    width: 8px;
  }

  .activity-table-wrapper::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 0 12px 12px 0;
  }

  .activity-table-wrapper::-webkit-scrollbar-thumb {
    background: rgba(160, 110, 230, 0.3);
    border-radius: 4px;
  }

  .activity-table-wrapper::-webkit-scrollbar-thumb:hover {
    background: rgba(160, 110, 230, 0.5);
  }

  .activity-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .activity-table thead {
    position: sticky;
    top: 0;
    background: rgba(139, 79, 207, 0.12);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 10;
  }

  .activity-table th {
    text-align: left;
    padding: 12px 16px;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(200, 185, 220, 0.7);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .activity-table tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background 0.15s;
  }

  .activity-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .activity-table tbody tr:last-child {
    border-bottom: none;
  }

  .activity-table td {
    padding: 12px 16px;
    color: rgba(220, 210, 235, 0.85);
    vertical-align: top;
  }

  .time-cell {
    color: rgba(180, 165, 210, 0.6);
    font-size: 12px;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .user-cell {
    font-weight: 500;
    color: rgba(180, 190, 230, 0.9);
  }

  .event-cell {
    line-height: 1.5;
    max-width: 500px;
  }

  .event-type-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    margin-right: 6px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .event-type-journal {
    background: rgba(243, 156, 18, 0.15);
    color: #f5c842;
  }

  .event-type-plot {
    background: rgba(91, 110, 245, 0.15);
    color: #8ba5f5;
  }

  .event-type-game {
    background: rgba(72, 187, 120, 0.15);
    color: #70d4a0;
  }

  .event-type-navigation {
    background: rgba(160, 110, 230, 0.15);
    color: #b08ae0;
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

  .pagination-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    padding: 12px 0;
  }

  .pagination-info {
    font-size: 13px;
    color: rgba(200, 185, 220, 0.6);
  }

  .pagination-buttons {
    display: flex;
    gap: 8px;
  }

  .page-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: rgba(200, 185, 220, 0.7);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }

  .page-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: #f0ece8;
  }

  .page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .page-btn-active {
    background: rgba(160, 110, 230, 0.2);
    border-color: rgba(160, 110, 230, 0.4);
    color: #b08ae0;
  }

  .page-btn-active:hover {
    background: rgba(160, 110, 230, 0.25);
    border-color: rgba(160, 110, 230, 0.5);
  }
`;

interface Props {
  sessionId: string;
}

interface UIEvent {
  id: string;
  type: string;
  action?: string;
  userId: string;
  timestamp: string;
  details?: any;
  plotType?: string;
  round?: number;
}

function getEventCategory(type: string): string {
  if (type.startsWith("journal")) return "journal";
  if (type.startsWith("plot")) return "plot";
  if (type.startsWith("layout")) return "navigation";
  if (type.startsWith("game")) return "game";
  return "navigation";
}

// Variable label mapping for readable names
const VARIABLE_LABELS: Record<string, string> = {
  time: "Time",
  infectedCadets: "Infected Cadets",
  healthyCadets: "Healthy Cadets",
  totalCadets: "Total Cadets",
  infectedSectors: "Infected Sectors",
  healthySectors: "Healthy Sectors",
  totalSectors: "Total Sectors",
  infectionRate: "Infection Rate",
  recoveryRate: "Recovery Rate",
};

function getReadableVariable(varName: string | undefined): string {
  if (!varName) return "unknown";
  return VARIABLE_LABELS[varName] || varName;
}

function formatEventDescription(event: UIEvent): string {
  const { type, action, details } = event;

  // Layout Events
  if (type === "layout.screen_mode_changed") {
    if (action === "single_to_dual") return "Switched to split-screen view (dual screen mode)";
    if (action === "dual_to_single") return "Switched to single-panel view";
    return `Changed screen layout from ${details?.from} to ${details?.to}`;
  }

  if (type === "layout.active_panel_changed") {
    const from = details?.from === "journal" ? "Journal" : "Data Plots";
    const to = details?.to === "journal" ? "Journal" : "Data Plots";
    return `Switched from ${from} to ${to}`;
  }

  // Journal Events
  if (type === "journal.round_navigation") {
    const toRound = details?.toRound || "?";
    return `Opened Round ${toRound} journal questions`;
  }

  if (type === "journal.round_submission") {
    const round = details?.round || "?";
    const count = details?.answerCount || 0;
    if (count === 0) return `Saved Round ${round} (no answers entered yet)`;
    return `Saved ${count} answer${count !== 1 ? "s" : ""} for Round ${round}`;
  }

  if (type === "journal.response_edited") {
    const questionNum = (details?.questionIndex || 0) + 1;
    const length = details?.length || 0;
    if (length === 0) return `Cleared answer for Question ${questionNum}`;
    return `Edited answer for Question ${questionNum} (${length} characters)`;
  }

  if (type === "journal.input") {
    const round = details?.round || "?";
    const questionNum = (details?.questionIndex || 0) + 1;
    if (action === "answer_focused") return `Started working on Round ${round}, Question ${questionNum}`;
    if (action === "answer_committed") {
      const length = details?.length || 0;
      return `Finished answering Round ${round}, Question ${questionNum} (${length} characters)`;
    }
  }

  // Plot Events
  if (type === "plot.type_changed") {
    const from = details?.from || "?";
    const to = details?.to || "?";
    const fromLabel = from.charAt(0).toUpperCase() + from.slice(1);
    const toLabel = to.charAt(0).toUpperCase() + to.slice(1);
    return `Changed chart type from ${fromLabel} to ${toLabel}`;
  }

  if (type === "plot.change_variable") {
    const axis = details?.axis || "?";
    const from = getReadableVariable(details?.from);
    const to = getReadableVariable(details?.to);
    if (axis === "x") return `Changed X-axis from "${from}" to "${to}"`;
    if (axis === "y") return `Changed Y-axis from "${from}" to "${to}"`;
    if (axis === "value") return `Changed data variable from "${from}" to "${to}"`;
  }

  if (type === "plot.pie_population_changed") {
    const from = details?.from === "cadets" ? "Cadets" : "Sectors";
    const to = details?.to === "cadets" ? "Cadets" : "Sectors";
    return `Changed pie chart to show ${to} instead of ${from}`;
  }

  // Game Events (legacy)
  if (type === "game.screen_mode_changed") {
    const to = details?.to === "dual" ? "split-screen" : "single-panel";
    return `Switched to ${to} mode`;
  }

  if (type === "game.panel_switched") {
    const from = details?.from === "journal" ? "Journal" : "Data Plots";
    const to = details?.to === "journal" ? "Journal" : "Data Plots";
    return `Switched from ${from} to ${to}`;
  }

  // Fallback
  if (action) {
    const readableAction = action.replace(/_/g, " ");
    return `${readableAction}`;
  }
  
  const readableType = type.replace(/\./g, " › ").replace(/_/g, " ");
  return readableType;
}

function SessionActivityLog({ sessionId }: Props) {
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const firestore = getFirestore();

  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    if (!sessionId) return;

    const q = query(
      collection(firestore, "ui_events"),
      where("sessionId", "==", sessionId),
      orderBy("serverTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: UIEvent[] = [];
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        } as UIEvent);
      });
      setEvents(data);
    });

    return () => unsubscribe();
  }, [sessionId, firestore]);

  // Calculate pagination
  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEvents = events.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (startPage > 2) pages.push("...");
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="activity-log-root">
        <div className="activity-log-header">
          <h3 className="activity-log-title">Live Activity Feed</h3>
          {events.length > 0 && (
            <span className="activity-badge">
              <span className="activity-badge-dot" />
              Live
            </span>
          )}
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div>No activity yet. Student actions will appear here in real-time.</div>
          </div>
        ) : (
          <>
            <div className="activity-table-wrapper">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th style={{ width: "100px" }}>Time</th>
                    <th style={{ width: "140px" }}>Student</th>
                    <th>Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEvents.map((event) => {
                    const category = getEventCategory(event.type);
                    return (
                      <tr key={event.id}>
                        <td className="time-cell">
                          {new Date(event.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="user-cell">{event.userId}</td>
                        <td className="event-cell">
                          <span className={`event-type-badge event-type-${category}`}>
                            {category}
                          </span>
                          {formatEventDescription(event)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <div className="pagination-info">
                  Showing {startIndex + 1}-{Math.min(endIndex, events.length)} of {events.length} events
                </div>
                
                <div className="pagination-buttons">
                  <button
                    className="page-btn"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {getPageNumbers().map((page, index) => 
                    typeof page === "number" ? (
                      <button
                        key={index}
                        className={`page-btn ${currentPage === page ? "page-btn-active" : ""}`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={index} style={{ padding: "0 8px", color: "rgba(200, 185, 220, 0.4)" }}>
                        {page}
                      </span>
                    )
                  )}

                  <button
                    className="page-btn"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default SessionActivityLog;