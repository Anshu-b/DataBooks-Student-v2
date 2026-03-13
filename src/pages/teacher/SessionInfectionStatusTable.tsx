import { useEffect, useMemo, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";
import { PLAYER_NAMES } from "../../config/playerNames";

const styles = `
  .infection-table-root {
    margin-top: 32px;
    font-family: 'DM Sans', sans-serif;
  }

  .infection-table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .infection-table-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #f0ece8;
  }

  .infection-table-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(72, 187, 120, 0.28);
    background: rgba(72, 187, 120, 0.12);
    color: #86e0ae;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .infection-table-badge-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #86e0ae;
    box-shadow: 0 0 10px rgba(134, 224, 174, 0.8);
  }

  .infection-table-grid {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .infection-table-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16);
  }

  .infection-table-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
  }

  .infection-table-card-title {
    margin: 0;
    color: #f0ece8;
    font-size: 15px;
    font-weight: 600;
  }

  .infection-table-card-meta {
    color: rgba(200, 185, 220, 0.72);
    font-size: 12px;
    font-weight: 500;
  }

  .infection-table {
    width: 100%;
    border-collapse: collapse;
  }

  .infection-table th,
  .infection-table td {
    text-align: left;
    padding: 12px 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    vertical-align: middle;
  }

  .infection-table th {
    color: rgba(200, 185, 220, 0.64);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .infection-table td {
    color: #f0ece8;
    font-size: 13px;
  }

  .infection-table tr:last-child td {
    border-bottom: none;
  }

  .infection-entity-name {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .infection-entity-primary {
    font-weight: 600;
  }

  .infection-entity-secondary {
    color: rgba(200, 185, 220, 0.62);
    font-size: 12px;
  }

  .infection-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 102px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .infection-status-pill::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
  }

  .infection-status-infected {
    color: #ff8e9c;
    background: rgba(220, 60, 80, 0.16);
    border: 1px solid rgba(220, 60, 80, 0.28);
  }

  .infection-status-healthy {
    color: #86e0ae;
    background: rgba(72, 187, 120, 0.14);
    border: 1px solid rgba(72, 187, 120, 0.25);
  }

  .infection-status-unknown {
    color: #d0c4dd;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .infection-empty-state {
    padding: 20px 18px;
    color: rgba(200, 185, 220, 0.72);
    font-size: 13px;
  }
`;

interface Props {
  sessionId: string;
}

type Reading = {
  device_id?: string;
  infection_status?: number;
  timestamp?: string;
};

type EntityStatus = {
  id: string;
  name: string;
  secondaryLabel: string;
  status: "infected" | "healthy" | "unknown";
  updatedAt: string;
};

type SessionStatusSnapshot = {
  cadets: EntityStatus[];
  sectors: EntityStatus[];
};

function SessionInfectionStatusTable({ sessionId }: Props) {
  const [statusSnapshot, setStatusSnapshot] = useState<SessionStatusSnapshot | null>(null);
  const db = getDatabase();

  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = ref(db, `sessions/${sessionId}`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const session = snapshot.val();

      if (!session) {
        setStatusSnapshot(null);
        return;
      }

      const totalCadets = session.metadata?.start?.cadets ?? 0;
      const totalSectors = session.metadata?.start?.sectors ?? 0;
      const readings = Object.values(session.readings ?? {}) as Reading[];

      const cadetStatuses = new Map<number, { status: 0 | 1; timestamp: string }>();
      const sectorStatuses = new Map<number, { status: 0 | 1; timestamp: string }>();

      const sortedReadings = readings
        .filter((reading) => typeof reading.device_id === "string")
        .sort((left, right) => {
          const leftMs = Date.parse(left.timestamp ?? "");
          const rightMs = Date.parse(right.timestamp ?? "");
          return leftMs - rightMs;
        });

      sortedReadings.forEach((reading) => {
        const deviceId = reading.device_id ?? "";
        const entityIndex = getDeviceIndex(deviceId);
        if (entityIndex === null) return;

        const payload = {
          status: reading.infection_status === 1 ? 1 : 0,
          timestamp: reading.timestamp ?? "",
        } as const;

        if (deviceId.startsWith("S") && entityIndex < totalCadets) {
          cadetStatuses.set(entityIndex, payload);
        }

        if (deviceId.startsWith("T") && entityIndex < totalSectors) {
          sectorStatuses.set(entityIndex, payload);
        }
      });

      setStatusSnapshot({
        cadets: buildEntityStatuses(totalCadets, "S", cadetStatuses),
        sectors: buildEntityStatuses(totalSectors, "T", sectorStatuses),
      });
    });

    return () => unsubscribe();
  }, [db, sessionId]);

  const totals = useMemo(() => {
    const cadets = statusSnapshot?.cadets ?? [];
    const sectors = statusSnapshot?.sectors ?? [];

    const infectedCadets = cadets.filter((entity) => entity.status === "infected").length;
    const infectedSectors = sectors.filter((entity) => entity.status === "infected").length;

    return {
      infectedCadets,
      infectedSectors,
    };
  }, [statusSnapshot]);

  return (
    <>
      <style>{styles}</style>
      <div className="infection-table-root">
        <div className="infection-table-header">
          <h3 className="infection-table-title">Live Infection Status</h3>
          <div className="infection-table-badge">
            <span className="infection-table-badge-dot" />
            Live Updates
          </div>
        </div>

        <div className="infection-table-grid">
          <StatusTableCard
            title="Sectors"
            meta={`${totals.infectedSectors} infected`}
            rows={statusSnapshot?.sectors ?? []}
          />
          <StatusTableCard
            title="Cadets"
            meta={`${totals.infectedCadets} infected`}
            rows={statusSnapshot?.cadets ?? []}
          />
        </div>
      </div>
    </>
  );
}

function StatusTableCard({
  title,
  meta,
  rows,
}: {
  title: string;
  meta: string;
  rows: EntityStatus[];
}) {
  return (
    <div className="infection-table-card">
      <div className="infection-table-card-header">
        <h4 className="infection-table-card-title">{title}</h4>
        <span className="infection-table-card-meta">{meta}</span>
      </div>

      {rows.length === 0 ? (
        <div className="infection-empty-state">No live data available yet.</div>
      ) : (
        <table className="infection-table">
          <thead>
            <tr>
              <th>Entity</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="infection-entity-name">
                    <span className="infection-entity-primary">{row.name}</span>
                    <span className="infection-entity-secondary">{row.secondaryLabel}</span>
                  </div>
                </td>
                <td>
                  <span
                    className={`infection-status-pill infection-status-${row.status}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td>{row.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function buildEntityStatuses(
  count: number,
  prefix: "S" | "T",
  latestStatuses: Map<number, { status: 0 | 1; timestamp: string }>
): EntityStatus[] {
  return Array.from({ length: count }, (_, index) => {
    const entityId = `${prefix}${index + 1}`;
    const latestStatus = latestStatuses.get(index);
    const displayName =
      prefix === "S"
        ? PLAYER_NAMES[index]
          ? `${PLAYER_NAMES[index]}`
          : `Cadet ${index + 1}`
        : `Sector ${index + 1}`;

    return {
      id: entityId,
      name: displayName,
      secondaryLabel: prefix === "S" ? entityId : `Telemetry ${entityId}`,
      status: latestStatus
        ? latestStatus.status === 1
          ? "infected"
          : "healthy"
        : "unknown",
      updatedAt: formatTimestamp(latestStatus?.timestamp),
    };
  });
}

function getDeviceIndex(deviceId: string): number | null {
  const numericPortion = Number.parseInt(deviceId.slice(1), 10);
  if (Number.isNaN(numericPortion) || numericPortion <= 0) {
    return null;
  }

  return numericPortion - 1;
}

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return "No reading yet";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Invalid timestamp";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default SessionInfectionStatusTable;
