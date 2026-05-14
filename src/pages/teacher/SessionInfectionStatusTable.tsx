import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
} from "firebase/database";

import { useSessionReadings }
  from "../../hooks/useSessionReadings";

import { useTeacherAuth }
  from "../../hooks/useTeacherAuth";

const styles = `
.game-controls-root {
  margin-top: 28px;
}

.game-controls-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 22px;
  padding: 28px;
  backdrop-filter: blur(18px);
}

.game-controls-title {
  margin: 0 0 26px;
  font-size: 28px;
  font-weight: 700;
  color: #f0ece8;
}

.controls-section-title {
  margin: 0 0 14px;
  color: rgba(220,210,235,0.92);
  font-size: 18px;
  font-weight: 600;
}

.controls-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.control-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-height: 52px;

  padding: 13px 20px;

  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.12);

  background: rgba(255,255,255,0.05);

  color: #f0ece8;

  font-size: 15px;
  font-weight: 600;

  cursor: pointer;

  transition: 0.18s;
}

.control-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(255,255,255,0.08);
}

.control-button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  transform: none;
}

.control-start {
  border-color: rgba(72,187,120,0.28);
  color: #86e0ae;
}

.control-meeting {
  border-color: rgba(160,110,230,0.28);
  color: #caa7ff;
}

.control-reset {
  border-color: rgba(255,100,120,0.28);
  color: #ff9cab;
}

.control-force {
  border-color: rgba(80,160,255,0.28);
  color: #9bc6ff;
}

.control-cancel {
  border-color: rgba(255,170,60,0.28);
  color: #ffcf7a;
}

.control-divider {
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: 28px 0;
}

.infect-row {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
}

.infect-select {
  flex: 1;
  min-width: 260px;

  height: 52px;

  padding: 0 16px;

  background: rgba(255,255,255,0.05);

  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;

  color: #f0ece8;

  font-size: 15px;

  outline: none;
}

.infect-select option {
  background: #2f2943;
  color: #f0ece8;
}

.infect-help {
  margin-top: 10px;

  color: rgba(210,200,225,0.72);

  font-size: 13px;
}

.status-pill-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  margin-top: 24px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  min-height: 42px;

  padding: 0 16px;

  border-radius: 999px;

  font-size: 14px;
  font-weight: 600;
}

.status-neutral {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(240,236,232,0.92);
}

.status-gold {
  background: rgba(243,156,18,0.14);
  border: 1px solid rgba(243,156,18,0.32);
  color: #f5c842;
}

.status-purple {
  background: rgba(160,110,230,0.14);
  border: 1px solid rgba(160,110,230,0.32);
  color: #caa7ff;
}

.status-red {
  background: rgba(220,60,80,0.14);
  border: 1px solid rgba(220,60,80,0.32);
  color: #ff9cab;
}

.telemetry-section {
  margin-top: 30px;
}

.telemetry-title {
  margin: 0 0 18px;
  color: #f0ece8;
  font-size: 20px;
  font-weight: 700;
}

.telemetry-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.telemetry-row {
  display: grid;

  grid-template-columns:
    100px
    1fr
    210px;

  gap: 18px;

  align-items: center;

  padding: 18px;

  border-radius: 16px;

  background: rgba(255,255,255,0.04);

  border: 1px solid rgba(255,255,255,0.08);
}

.telemetry-id {
  font-family: monospace;
  font-size: 18px;
  font-weight: 700;
  color: #d8d4ff;
}

.telemetry-bar-shell {
  position: relative;

  height: 30px;

  overflow: hidden;

  border-radius: 999px;

  background: rgba(255,255,255,0.08);
}

.telemetry-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;

  border-radius: 999px;

  transition:
    width 0.2s ease,
    background 0.2s ease;
}

.telemetry-label {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 2;

  font-size: 13px;
  font-weight: 700;

  color: white;

  text-shadow:
    0 0 6px rgba(0,0,0,0.6);
}

.telemetry-time {
  color: rgba(220,210,235,0.72);
  font-size: 13px;
  text-align: right;
}
`;

interface Props {
  sessionId: string;
}

function SessionInfectionStatusTable({
  sessionId,
}: Props) {

  const { user } =
    useTeacherAuth();

  const { readings } =
    useSessionReadings(sessionId);

  const db =
    getDatabase();

  const pollKilledRef =
    useRef(false);

  const [
    infectTarget,
    setInfectTarget,
  ] = useState("");

  const [
    meetingActive,
    setMeetingActive,
  ] = useState(false);

  const [
    meetingCooldown,
    setMeetingCooldown,
  ] = useState(false);

  const [
    roundCooldown,
    setRoundCooldown,
  ] = useState(false);

  const [
    currentCommand,
    setCurrentCommand,
  ] = useState("resume");

  const [
    resetPolling,
    setResetPolling,
  ] = useState(false);

  const [
    infectPolling,
    setInfectPolling,
  ] = useState(false);

  const [
    pollCount,
    setPollCount,
  ] = useState(0);

  const [
    pollTarget,
    setPollTarget,
  ] = useState(0);

  const [
    resetMinimumRemaining,
    setResetMinimumRemaining,
  ] = useState(45);

  const [
    infectMinimumRemaining,
    setInfectMinimumRemaining,
  ] = useState(45);

  useEffect(() => {

    const commandRef = ref(
      db,
      "control/command"
    );

    const unsubscribe =
      onValue(
        commandRef,
        (snapshot) => {

          const value =
            snapshot.val();

          if (
            typeof value ===
            "string"
          ) {

            setCurrentCommand(
              value
            );
          }
        }
      );

    return () => unsubscribe();

  }, [db]);

  useEffect(() => {

    async function
      loadMeetingState() {

      const meetingsSnapshot =
        await get(
          ref(
            db,
            `sessions/${sessionId}/meetings`
          )
        );

      if (
        !meetingsSnapshot.exists()
      ) {

        setMeetingActive(
          false
        );

        return;
      }

      const meetings =
        meetingsSnapshot.val();

      const hasActiveMeeting =
        Object.values(
          meetings
        ).some(
          (meeting: any) =>
            meeting.startTime &&
            !meeting.endTime
        );

      setMeetingActive(
        hasActiveMeeting
      );
    }

    loadMeetingState();

  }, [db, sessionId]);

  async function setCommand(
    command: string,
    target?: string
  ) {

    await set(
      ref(
        db,
        "control/command"
      ),
      command
    );

    if (target) {

      await set(
        ref(
          db,
          "control/target"
        ),
        target
      );

    } else {

      await set(
        ref(
          db,
          "control/target"
        ),
        null
      );
    }
  }

  const deviceRows =
    useMemo(() => {

      const map =
        new Map();

      readings
        .sort((a, b) => {

          return (
            Date.parse(
              b.timestamp ??
              ""
            ) -
            Date.parse(
              a.timestamp ??
              ""
            )
          );
        })
        .forEach(
          (reading) => {

            const id =
              reading.device_id;

            if (
              !id ||
              map.has(id)
            ) {
              return;
            }

            map.set(id, {
              id,

              infection:
                reading.infection_status ??
                0,

              updated:
                reading.timestamp ??
                "Unknown",
            });
          }
        );

      return Array.from(
        map.values()
      ).sort((a, b) =>
        a.id.localeCompare(
          b.id
        )
      );

    }, [readings]);

  const DEVICE_ALIVE_WINDOW_MS =
  10000;

  const MAX_INFECT_POLL_MS =
    120000;

  function getLatestDeviceReading(
    readingsList: any[],
    deviceId: string
  ) {

    const matchingReadings =
      readingsList
        .filter(
          (reading) =>
            reading.device_id ===
            deviceId
        )
        .sort((a, b) => {

          return (
            Date.parse(
              b.timestamp ??
              ""
            ) -
            Date.parse(
              a.timestamp ??
              ""
            )
          );
        });

    if (
      matchingReadings.length === 0
    ) {
      return null;
    }

    return matchingReadings[0];
  }

  function isReadingAlive(
    reading: any
  ) {

    const timestampMs =
      Date.parse(
        reading?.timestamp ??
        ""
      );

    if (
      Number.isNaN(
        timestampMs
      )
    ) {
      return false;
    }

    return (
      Date.now() -
        timestampMs <
      DEVICE_ALIVE_WINDOW_MS
    );
  }
    
  async function startRound() {

    if (
      roundCooldown ||
      resetPolling ||
      infectPolling
    ) {
      return;
    }

    setRoundCooldown(
      true
    );

    await setCommand(
      "resume"
    );

    setTimeout(() => {

      setRoundCooldown(
        false
      );

    }, 3000);
  }

  async function startMeeting() {

    if (
      !user ||
      meetingCooldown ||
      resetPolling ||
      infectPolling
    ) {
      return;
    }

    setMeetingCooldown(
      true
    );

    await setCommand(
      "pause"
    );

    const meetingsRef =
      ref(
        db,
        `sessions/${sessionId}/meetings`
      );

    const meetingsSnapshot =
      await get(
        meetingsRef
      );

    const meetings =
      meetingsSnapshot.exists()
        ? meetingsSnapshot.val()
        : {};

    const nextMeetingNumber =
      Object.keys(
        meetings
      ).reduce(
        (
          maxValue,
          meetingId
        ) => {

          const match =
            meetingId.match(
              /^meeting_(\d+)$/
            );

          if (!match) {
            return maxValue;
          }

          return Math.max(
            maxValue,
            Number(
              match[1]
            )
          );

        },
        0
      ) + 1;

    await set(
      ref(
        db,
        `sessions/${sessionId}/meetings/meeting_${nextMeetingNumber}`
      ),
      {
        startTime:
          new Date()
            .toISOString(),

        startedBy:
          user.email ??
          "Unknown",
      }
    );

    setMeetingActive(
      true
    );

    setTimeout(() => {

      setMeetingCooldown(
        false
      );

    }, 3000);
  }

  async function endMeeting() {

    if (
      meetingCooldown ||
      resetPolling ||
      infectPolling
    ) {
      return;
    }

    setMeetingCooldown(
      true
    );

    const meetingsSnapshot =
      await get(
        ref(
          db,
          `sessions/${sessionId}/meetings`
        )
      );

    if (
      !meetingsSnapshot.exists()
    ) {
      return;
    }

    const meetings =
      meetingsSnapshot.val();

    const activeMeetingEntry =
      Object.entries(
        meetings
      ).find(
        ([, meeting]: any) =>
          meeting.startTime &&
          !meeting.endTime
      );

    if (
      !activeMeetingEntry
    ) {
      return;
    }

    const [meetingId] =
      activeMeetingEntry;

    await update(
      ref(
        db,
        `sessions/${sessionId}/meetings/${meetingId}`
      ),
      {
        endTime:
          new Date()
            .toISOString(),

        endedBy:
          user?.email ??
          "Unknown",
      }
    );

    setMeetingActive(
      false
    );

    await setCommand(
      "pause"
    );

    setTimeout(() => {

      setMeetingCooldown(
        false
      );

    }, 3000);
  }

  async function
    resetAllDevices() {

    if (
      resetPolling ||
      infectPolling
    ) {
      return;
    }

    pollKilledRef.current =
      false;

    setResetPolling(
      true
    );

    setPollCount(0);

    setPollTarget(0);

    setResetMinimumRemaining(
      45
    );

    await setCommand(
      "reset_all"
    );

    const startTime =
      Date.now();

    async function
      pollLoop() {

      if (
        pollKilledRef.current
      ) {

        setResetPolling(
          false
        );

        return;
      }

      const elapsedSeconds =
        Math.floor(
          (Date.now() -
            startTime) / 1000
        );

      const remaining =
        Math.max(
          0,
          45 - elapsedSeconds
        );

      setResetMinimumRemaining(
        remaining
      );

      const latestSnapshot =
        await get(
          ref(
            db,
            `sessions/${sessionId}/readings`
          )
        );

      if (
        !latestSnapshot.exists()
      ) {

        setTimeout(
          pollLoop,
          1000
        );

        return;
      }

      const readingsValue =
        latestSnapshot.val();

      const newestMap =
        new Map();

      Object.values(
        readingsValue
      ).forEach(
        (reading: any) => {

          const id =
            reading.device_id;

          if (!id) {
            return;
          }

          const timestampMs =
            Date.parse(
              reading.timestamp ??
              ""
            );

          if (
            Number.isNaN(
              timestampMs
            )
          ) {
            return;
          }

          const alive =
            Date.now() -
              timestampMs <
            10000;

          if (!alive) {
            return;
          }

          newestMap.set(
            id,
            reading.infection_status ??
              0
          );
        }
      );

      const activeIds =
        Array.from(
          newestMap.keys()
        );

      setPollTarget(
        activeIds.length
      );

      let healthyCount =
        0;

      activeIds.forEach(
        (deviceId) => {

          if (
            newestMap.get(
              deviceId
            ) === 0
          ) {

            healthyCount += 1;
          }
        }
      );

      setPollCount(
        healthyCount
      );

      const minimumReached =
        remaining === 0;

      const allHealthy =
        activeIds.length > 0 &&
        healthyCount ===
          activeIds.length;

      if (
        minimumReached &&
        allHealthy
      ) {

        await setCommand(
          "pause"
        );

        setResetPolling(
          false
        );

        return;
      }

      setTimeout(
        pollLoop,
        1000
      );
    }

    pollLoop();
  }

async function
  infectSector() {

    if (
      infectPolling ||
      resetPolling ||
      infectTarget.length ===
        0
    ) {
      return;
    }

    pollKilledRef.current =
      false;

    setInfectPolling(
      true
    );

    setInfectMinimumRemaining(
      45
    );

    await setCommand(
      "infect",
      infectTarget
    );

    const startTime =
      Date.now();

    async function
      pollLoop() {

      if (
        pollKilledRef.current
      ) {

        setInfectPolling(
          false
        );

        return;
      }

      const elapsedSeconds =
        Math.floor(
          (Date.now() -
            startTime) / 1000
        );

      const remaining =
        Math.max(
          0,
          45 - elapsedSeconds
        );

      setInfectMinimumRemaining(
        remaining
      );

      const pollElapsedMs =
        Date.now() -
        startTime;

      if (
        pollElapsedMs >
        MAX_INFECT_POLL_MS
      ) {

        console.error(
          "Infect polling timed out."
        );

        await setCommand(
          "pause"
        );

        setInfectPolling(
          false
        );

        return;
      }

      const latestSnapshot =
        await get(
          ref(
            db,
            `sessions/${sessionId}/readings`
          )
        );

      if (
        !latestSnapshot.exists()
      ) {

        setTimeout(
          pollLoop,
          1000
        );

        return;
      }

      const readingsValue =
        latestSnapshot.val();

      const readingsList =
        Object.values(
          readingsValue
        ) as any[];

      const targetReading =
        getLatestDeviceReading(
          readingsList,
          infectTarget
        );

      const targetAlive =
        targetReading &&
        isReadingAlive(
          targetReading
        );

      const infected =
        targetAlive &&
        (
          targetReading
            .infection_status ??
          0
        ) >= 1;

      const minimumReached =
        remaining === 0;

      if (
        infected &&
        minimumReached
      ) {

        await setCommand(
          "pause"
        );

        setInfectPolling(
          false
        );

        return;
      }

      setTimeout(
        pollLoop,
        1000
      );
    }

    pollLoop();
  }

  async function
    killAllPolling() {

    pollKilledRef.current =
      true;

    setResetPolling(
      false
    );

    setInfectPolling(
      false
    );

    setPollCount(0);

    setPollTarget(0);

    await setCommand(
      "resume"
    );
  }

  async function
    cancelInfect() {

    pollKilledRef.current =
      true;

    setInfectPolling(
      false
    );

    await setCommand(
      "pause"
    );
  }

  const sectorOptions =
    deviceRows.map(
      (row) => row.id
    );

  return (
    <>
      <style>
        {styles}
      </style>

      <div className="game-controls-root">

        <div className="game-controls-card">

          <h2 className="game-controls-title">
            Game Controls
          </h2>

          <h3 className="controls-section-title">
            Round and meeting
          </h3>

          <div className="controls-row">

            <button
              className="control-button control-start"
              disabled={
                roundCooldown ||
                resetPolling ||
                infectPolling
              }
              onClick={() =>
                startRound()
              }
            >
              ▶ Start round
            </button>

            <button
              className="control-button control-meeting"
              disabled={
                meetingCooldown ||
                resetPolling ||
                infectPolling
              }
              onClick={() =>
                meetingActive
                  ? endMeeting()
                  : startMeeting()
              }
            >
              {meetingActive
                ? "◉ End meeting"
                : "◎ Start meeting"}
            </button>

            <button
              className="control-button control-reset"
              disabled={
                resetPolling ||
                infectPolling
              }
              onClick={() =>
                resetAllDevices()
              }
            >
              ↺ Reset all
            </button>

            <button
              className="control-button control-force"
              onClick={() =>
                killAllPolling()
              }
            >
              ▷ Force start
            </button>

          </div>

          <div className="control-divider" />

          <h3 className="controls-section-title">
            Infect a sector
          </h3>

          <div className="infect-row">

            <select
              className="infect-select"
              value={
                infectTarget
              }
              onChange={(event) =>
                setInfectTarget(
                  event.target.value
                )
              }
            >

              <option value="">
                Select sector...
              </option>

              {sectorOptions.map(
                (sector) => (
                  <option
                    key={sector}
                    value={sector}
                  >
                    {sector}
                  </option>
                )
              )}

            </select>

            <button
              className="control-button control-reset"
              disabled={
                infectPolling ||
                resetPolling ||
                infectTarget.length ===
                  0
              }
              onClick={() =>
                infectSector()
              }
            >
              ☣ Infect sector
            </button>

            {infectPolling && (
              <button
                className="control-button control-cancel"
                onClick={() =>
                  cancelInfect()
                }
              >
                ✕ Cancel infect
              </button>
            )}

          </div>

          <div className="infect-help">
            Safe to infect while paused —
            spread only begins when
            Start round is hit.
          </div>

          <div className="status-pill-row">

            <div className="status-pill status-neutral">
              Command:
              {" "}
              {currentCommand}
            </div>

            {currentCommand ===
              "infect" && (
              <div className="status-pill status-neutral">
                Target:
                {" "}
                {infectTarget}
              </div>
            )}

            <div className="status-pill status-purple">
              Meeting:
              {" "}
              {meetingActive
                ? "active"
                : "inactive"}
            </div>

            <div className="status-pill status-gold">
              Spread:
              {" "}
              {currentCommand ===
              "pause"
                ? "paused"
                : "active"}
            </div>

            {resetPolling && (
              <div className="status-pill status-red">
                Reset poll:
                {" "}
                {pollCount}/
                {pollTarget}
                {" "}
                healthy
              </div>
            )}

            {resetPolling && (
              <div className="status-pill status-gold">
                Minimum reset hold:
                {" "}
                {resetMinimumRemaining}s
              </div>
            )}

            {infectPolling && (
              <div className="status-pill status-red">
                Infect verification:
                {" "}
                {infectMinimumRemaining}s
              </div>
            )}

          </div>

          <div className="telemetry-section">

            <h3 className="telemetry-title">
              Live infection telemetry
            </h3>

            <div className="telemetry-grid">

              {deviceRows.map(
                (row) => {

                  const clamped =
                    Math.max(
                      0,
                      Math.min(
                        1,
                        row.infection
                      )
                    );

                  const percent =
                    clamped * 100;

                  let color =
                    "#38d66b";

                  if (
                    clamped >= 1
                  ) {

                    color =
                      "#ff2f45";

                  } else if (
                    clamped >= 0.5
                  ) {

                    color =
                      "#ff5c70";

                  } else if (
                    clamped > 0
                  ) {

                    color =
                      "#ffb347";
                  }

                  return (
                    <div
                      className="telemetry-row"
                      key={row.id}
                    >

                      <div className="telemetry-id">
                        {row.id}
                      </div>

                      <div className="telemetry-bar-shell">

                        <div
                          className="telemetry-bar-fill"
                          style={{
                            width:
                              `${percent}%`,
                            background:
                              color,
                          }}
                        />

                        <div className="telemetry-label">
                          {row.infection.toFixed(
                            2
                          )}
                        </div>

                      </div>

                      <div className="telemetry-time">
                        {row.updated}
                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </div>

      </div>

    </>
  );
}

export default SessionInfectionStatusTable;