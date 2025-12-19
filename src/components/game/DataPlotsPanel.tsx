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


function DataPlotsPanel() {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>DataPlots</h2>
        <p>Please select variables to display a plot.</p>
        {/* Nivo plots later */}
      </div>
    );
  }
  
  export default DataPlotsPanel;
  