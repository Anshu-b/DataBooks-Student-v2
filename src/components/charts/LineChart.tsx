/**
 * LineChart
 * ---------
 * Thin wrapper around @nivo/line.
 * Expects data already shaped for Nivo.
 *
 * This component:
 *  - Does NOT know about plot config
 *  - Does NOT know about telemetry
 *  - Only renders what it is given
 */

import { ResponsiveLine } from "@nivo/line";

type LineChartProps = {
  data: {
    id: string;
    data: { x: number | string; y: number }[];
  }[];
};

function LineChart({ data }: LineChartProps) {
  return (
    <div style={{ height: 400 }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 40, right: 40, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: "auto", max: "auto" }}
        axisBottom={{ legend: "X", legendOffset: 36 }}
        axisLeft={{ legend: "Y", legendOffset: -50 }}
        colors={{ scheme: "category10" }}
        pointSize={6}
        useMesh
      />
    </div>
  );
}

export default LineChart;
