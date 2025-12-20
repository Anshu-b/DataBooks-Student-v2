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
import {
  getValidVariables,
  isValidPlotSelection,
} from "../../utils/plotValidation";
import LineChart from "../charts/LineChart";
import { buildLinePlotData } from "../../utils/buildLinePlotData";
import { aggregateTelemetry } from "../../analytics/aggregateTelemetry";
import rawSession from "../../data/exampleRawSession.json";
import ScatterChart from "../charts/ScatterChart";
import HistogramChart from "../charts/HistogramChart";
import { buildScatterPlotData } from "../../utils/buildScatterPlotData";
import { buildHistogramPlotData } from "../../utils/buildHistogramPlotData";



const telemetry = aggregateTelemetry(
    Object.values(rawSession.readings)
  );

  
type PlotTypeId = "line" | "scatter" | "histogram";

function DataPlotsPanel() {
  /* -----------------------------
   * Selection State
   * ----------------------------- */
  const [plotType, setPlotType] = useState<PlotTypeId>("line");
  const [xVar, setXVar] = useState<string | undefined>("time");
  const [yVar, setYVar] = useState<string | undefined>("infectedCadets");
  const [valueVar, setValueVar] = useState<string | undefined>("infectedCadets");

  /* -----------------------------
   * Derived valid options
   * ----------------------------- */
  const validXVars = getValidVariables(plotType, "x");
  const validYVars = getValidVariables(plotType, "y");
  const validValueVars = getValidVariables(plotType, "value");

  /* -----------------------------
   * Auto-correct invalid selections
   * ----------------------------- */
  useEffect(() => {
    const valid = isValidPlotSelection({
      plotTypeId: plotType,
      xVar,
      yVar,
      valueVar,
    });

    if (!valid) {
      // Reset based on plot type
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

  /* -----------------------------
   * Render
   * ----------------------------- */
  return (
    <div
      style={{
        padding: "2rem",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)",
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
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
          }}
        >
          📊
        </div>
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#2d3748",
            margin: 0,
          }}
        >
          Data Plots
        </h2>
      </div>

      {/* Control Panel */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          marginBottom: "2rem",
        }}
      >
        {/* Plot Type Selector */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#4a5568",
              marginBottom: "0.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            📈 Plot Type
          </label>
          <select
            value={plotType}
            onChange={(e) => setPlotType(e.target.value as PlotTypeId)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              fontWeight: 500,
              color: "#2d3748",
              background: "#f7fafc",
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#667eea";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {PLOT_TYPES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Line / Scatter Controls */}
        {plotType !== "histogram" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#4a5568",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                ➡️ X-Axis
              </label>
              <select
                value={xVar}
                onChange={(e) => setXVar(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "#2d3748",
                  background: "#f7fafc",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#667eea";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {validXVars.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#4a5568",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                ⬆️ Y-Axis
              </label>
              <select
                value={yVar}
                onChange={(e) => setYVar(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "#2d3748",
                  background: "#f7fafc",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#667eea";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {validYVars.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Histogram Controls */}
        {plotType === "histogram" && (
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#4a5568",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              📊 Variable to Analyze
            </label>
            <select
              value={valueVar}
              onChange={(e) => setValueVar(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                fontWeight: 500,
                color: "#2d3748",
                background: "#f7fafc",
                border: "2px solid #e2e8f0",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {validValueVars.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {plotType === "line" && xVar && yVar && (
        <LineChart
            data={buildLinePlotData(
            telemetry,
            xVar as any,
            yVar as any
            )}
        />
        )}

        {plotType === "scatter" && xVar && yVar && (
        <ScatterChart
            data={buildScatterPlotData(
            telemetry,
            xVar as any,
            yVar as any
            )}
        />
        )}

        {plotType === "histogram" && valueVar && (
        <HistogramChart
            data={buildHistogramPlotData(
            telemetry,
            valueVar as any
            )}
        />
        )}


      {/* Current Selection Display */}
      <div
        style={{
          background: "rgba(102, 126, 234, 0.1)",
          borderRadius: "12px",
          padding: "1rem",
          border: "2px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        <div
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#4a5568",
            marginBottom: "0.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          🔍 Current Selection
        </div>
        <pre
          style={{
            margin: 0,
            color: "#2d3748",
            fontSize: "0.9rem",
            fontFamily: "monospace",
            background: "white",
            padding: "1rem",
            borderRadius: "8px",
            overflow: "auto",
          }}
        >
          {JSON.stringify({ plotType, xVar, yVar, valueVar }, null, 2)}
        </pre>
      </div>
      
    </div>
  );
}

export default DataPlotsPanel;