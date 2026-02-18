/**
 * DataPlotsPanel
 * --------------
 * Container for data visualizations during gameplay.
 *
 * Responsibilities:
 *   - Allow users to select variables and plot types
 *   - Render plots based on game telemetry
 *
 * Non-responsibilities:
 *   - Journal rendering
 *   - Layout decisions
 *   - Game state ownership
 *
 * Plot rendering libraries (e.g., Nivo) should be
 * isolated within this panel or its children.
 */

import { useEffect, useState } from "react";
import { PLOT_TYPES } from "../../config/plots";
import { getValidVariables, isValidPlotSelection } from "../../utils/plotValidation";
import LineChart from "../charts/LineChart";
import { buildLinePlotData } from "../../utils/buildLinePlotData";
import { aggregateTelemetry } from "../../analytics/aggregateTelemetry";
import ScatterChart from "../charts/ScatterChart";
import HistogramChart from "../charts/HistogramChart";
import PieChart from "../charts/PieChart";
import { buildPiePlotData } from "../../utils/buildPiePlotData";
import { buildScatterPlotData } from "../../utils/buildScatterPlotData";
import { buildHistogramPlotData } from "../../utils/buildHistogramPlotData";
import { useLogger } from "../../logging/LoggingProvider";
import { useGameStateContext } from "../../state/GameStateContext";
import { onValue } from "firebase/database";
import { getSessionRef } from "../../firebase/getSessionRef";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .plots-root {
    height: 100%;
    padding: 2rem;
    overflow-y: auto;
    background: #f0f4fb;
    background-image:
      radial-gradient(ellipse at 15% 25%, rgba(102, 126, 234, 0.1) 0%, transparent 55%),
      radial-gradient(ellipse at 85% 70%, rgba(91, 110, 245, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 95%, rgba(118, 75, 162, 0.07) 0%, transparent 50%);
    font-family: 'DM Sans', sans-serif;
    position: relative;
  }

  .plots-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236060c0' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  /* ── Header ── */
  .plots-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 22px;
    position: relative;
    z-index: 1;
  }

  .plots-icon {
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, rgba(139, 79, 207, 0.5), rgba(91, 110, 245, 0.5));
    border: 1px solid rgba(160, 110, 230, 0.4);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 4px 16px rgba(100, 70, 200, 0.25);
    flex-shrink: 0;
  }

  .plots-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: #1e1b3a;
    margin: 0 0 2px;
    letter-spacing: -0.01em;
  }

  .plots-subtitle {
    font-size: 12px;
    font-weight: 300;
    color: rgba(80, 70, 130, 0.55);
    margin: 0;
    letter-spacing: 0.04em;
  }

  /* ── Control card ── */
  .control-card {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(102, 126, 234, 0.15);
    border-radius: 18px;
    padding: 20px 22px;
    margin-bottom: 18px;
    box-shadow: 0 4px 20px rgba(80, 60, 160, 0.08);
    position: relative;
    z-index: 1;
  }

  /* ── Field label ── */
  .field-label {
    display: block;
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(80, 70, 140, 0.6);
    margin-bottom: 8px;
  }

  /* ── Select ── */
  .plot-select {
    width: 100%;
    padding: 11px 14px;
    background: rgba(240, 244, 255, 0.8);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 11px;
    color: #1e1b3a;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%236070c0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
  }

  .plot-select option {
    background: #ffffff;
    color: #1e1b3a;
  }

  .plot-select:focus {
    border-color: rgba(102, 126, 234, 0.55);
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
  }

  .axis-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* ── Plot title ── */
  .plot-title-row {
    text-align: center;
    margin-bottom: 14px;
    position: relative;
    z-index: 1;
  }

  .plot-title-text {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 600;
    color: #1e1b3a;
    margin: 0;
    letter-spacing: -0.01em;
  }

  /* ── Plot area card ── */
  .plot-area-card {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(102, 126, 234, 0.12);
    border-radius: 18px;
    padding: 12px 8px 8px;
    margin-bottom: 18px;
    box-shadow: 0 4px 24px rgba(80, 60, 160, 0.08);
    position: relative;
    z-index: 1;
    overflow: hidden;
  }

  /* ── Current selection card ── */
  .selection-card {
    background: rgba(102, 126, 234, 0.07);
    border: 1px solid rgba(102, 126, 234, 0.16);
    border-radius: 14px;
    padding: 14px 18px;
    position: relative;
    z-index: 1;
  }

  .selection-label {
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(80, 70, 140, 0.55);
    margin: 0 0 10px;
  }

  .selection-pre {
    margin: 0;
    color: #3a3560;
    font-size: 12px;
    font-family: 'DM Mono', 'Fira Code', monospace;
    background: rgba(255, 255, 255, 0.7);
    padding: 12px 14px;
    border-radius: 10px;
    overflow: auto;
    border: 1px solid rgba(102, 126, 234, 0.12);
    line-height: 1.6;
  }

  .control-divider {
    height: 1px;
    background: rgba(102, 126, 234, 0.1);
    margin: 16px 0;
  }
`;

type PlotTypeId = "line" | "scatter" | "histogram" | "pie";

function getPlotTitle({
  plotType,
  xLabel,
  yLabel,
  valueLabel,
  piePopulation,
}: {
  plotType: PlotTypeId;
  xLabel?: string;
  yLabel?: string;
  valueLabel?: string;
  piePopulation?: "cadets" | "sectors";
}) {
  switch (plotType) {
    case "line":      return `${yLabel} over ${xLabel}`;
    case "scatter":   return `${yLabel} vs ${xLabel}`;
    case "histogram": return `Distribution of ${valueLabel}`;
    case "pie":       return piePopulation === "cadets" ? "Cadet Health Distribution" : "Sector Health Distribution";
    default:          return "";
  }
}

function DataPlotsPanel() {
  const [plotType, setPlotType] = useState<PlotTypeId>("line");
  const [xVar, setXVar] = useState<string | undefined>("time");
  const [yVar, setYVar] = useState<string | undefined>("infectedCadets");
  const [valueVar, setValueVar] = useState<string | undefined>("infectedCadets");

  const validXVars = getValidVariables(plotType, "x");
  const validYVars = getValidVariables(plotType, "y");
  const validValueVars = getValidVariables(plotType, "value");
  const logger = useLogger();

  const { gameState } = useGameStateContext();
  const sessionId = gameState.sessionId;

  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    const sessionRef = getSessionRef(sessionId);
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      if (!snapshot.exists()) { setTelemetry([]); setLoading(false); return; }
      setTelemetry(aggregateTelemetry(snapshot.val()));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [sessionId]);

  useEffect(() => {
    const valid = isValidPlotSelection({ plotTypeId: plotType, xVar, yVar, valueVar });
    if (!valid) {
      if (plotType === "histogram") {
        setValueVar(validValueVars[0]?.id);
        setXVar(undefined);
        setYVar(undefined);
      } else {
        setXVar(validXVars[0]?.id);
        setYVar(validYVars[0]?.id);
        setValueVar(undefined);
      }
    }
  }, [plotType, xVar, yVar, valueVar, validXVars, validYVars, validValueVars]);

  const xLabel = validXVars.find(v => v.id === xVar)?.label ?? xVar;
  const yLabel = validYVars.find(v => v.id === yVar)?.label ?? yVar;
  const valueLabel = validValueVars.find(v => v.id === valueVar)?.label ?? valueVar;

  type PiePopulation = "cadets" | "sectors";
  const [piePopulation, setPiePopulation] = useState<PiePopulation>("cadets");

  const isTimeAxis = xVar === "time";
  const plotTitle = getPlotTitle({ plotType, xLabel, yLabel, valueLabel, piePopulation });

  return (
    <>
      <style>{styles}</style>
      <div className="plots-root">

        {/* Header */}
        <div className="plots-header">
          <div className="plots-icon">📊</div>
          <div>
            <h2 className="plots-title">Data Plots</h2>
            <p className="plots-subtitle">Visualize session telemetry</p>
          </div>
        </div>

        {/* Control card */}
        <div className="control-card">

          {/* Plot type */}
          <div style={{ marginBottom: (plotType === "line" || plotType === "scatter" || plotType === "histogram" || plotType === "pie") ? 0 : 0 }}>
            <label className="field-label">Plot Type</label>
            <select
              className="plot-select"
              value={plotType}
              onChange={(e) => {
                const next = e.target.value as PlotTypeId;
                if (next !== plotType) {
                  logger.log({
                    type: "plot.type_changed",
                    action: `${plotType}_to_${next}`,
                    userId: gameState.player.name,
                    sessionId: gameState.sessionId,
                    details: { from: plotType, to: next },
                  });
                }
                setPlotType(next);
              }}
            >
              {PLOT_TYPES.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Line / Scatter axis controls */}
          {(plotType === "scatter" || plotType === "line") && (
            <>
              <div className="control-divider" />
              <div className="axis-grid">
                <div>
                  <label className="field-label">X-Axis</label>
                  <select
                    className="plot-select"
                    value={xVar}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next !== xVar) {
                        logger.log({ type: "plot.change_variable", action: "x_variable_changed", userId: gameState.player.name, sessionId: gameState.sessionId, plotType, details: { axis: "x", from: xVar, to: next } });
                      }
                      setXVar(next);
                    }}
                  >
                    {validXVars.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Y-Axis</label>
                  <select
                    className="plot-select"
                    value={yVar}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next !== yVar) {
                        logger.log({ type: "plot.change_variable", action: "y_variable_changed", userId: gameState.player.name, sessionId: gameState.sessionId, plotType, details: { axis: "y", from: yVar, to: next } });
                      }
                      setYVar(next);
                    }}
                  >
                    {validYVars.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Histogram controls */}
          {plotType === "histogram" && (
            <>
              <div className="control-divider" />
              <div>
                <label className="field-label">Variable to Analyze</label>
                <select
                  className="plot-select"
                  value={valueVar}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next !== valueVar) {
                      logger.log({ type: "plot.change_variable", action: "value_variable_changed", userId: gameState.player.name, sessionId: gameState.sessionId, plotType, details: { axis: "value", from: valueVar, to: next } });
                    }
                    setValueVar(next);
                  }}
                >
                  {validValueVars.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Pie controls */}
          {plotType === "pie" && (
            <>
              <div className="control-divider" />
              <div>
                <label className="field-label">Population</label>
                <select
                  className="plot-select"
                  value={piePopulation}
                  onChange={(e) => {
                    const next = e.target.value as PiePopulation;
                    if (next !== piePopulation) {
                      logger.log({ type: "plot.pie_population_changed", action: "population_changed", userId: gameState.player.name, sessionId: gameState.sessionId, details: { from: piePopulation, to: next } });
                    }
                    setPiePopulation(next);
                  }}
                >
                  <option value="cadets">Cadets</option>
                  <option value="sectors">Sectors</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Plot title */}
        {plotTitle && (
          <div className="plot-title-row">
            <h3 className="plot-title-text">{plotTitle}</h3>
          </div>
        )}

        {/* Plot area */}
        <div className="plot-area-card">
          {plotType === "line" && xVar && yVar && (
            <LineChart
              data={buildLinePlotData(telemetry, xVar as any, yVar as any)}
              xScaleType={isTimeAxis ? "time" : "point"}
              xLegend={xLabel}
              yLegend={yLabel}
            />
          )}
          {plotType === "scatter" && xVar && yVar && (
            <ScatterChart
              data={buildScatterPlotData(telemetry, xVar as any, yVar as any)}
              xLegend={xLabel}
              yLegend={yLabel}
            />
          )}
          {plotType === "histogram" && valueVar && (
            <HistogramChart
              data={buildHistogramPlotData(telemetry, valueVar as any)}
              xLegend={valueLabel}
            />
          )}
          {plotType === "pie" && (
            <PieChart data={buildPiePlotData(telemetry, piePopulation)} />
          )}
        </div>

        {/* Current selection */}
        <div className="selection-card">
          <p className="selection-label">Current Selection</p>
          <pre className="selection-pre">
            {JSON.stringify({ plotType, xVar, yVar, valueVar }, null, 2)}
          </pre>
        </div>

      </div>
    </>
  );
}

export default DataPlotsPanel;