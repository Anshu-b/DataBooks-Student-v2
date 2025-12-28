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
    data: { x: number | string | Date; y: number }[];
  }[];

  xScaleType?: "point" | "time";
  xFormat?: string;
  xLegend?: string;
  yLegend?: string;
};

function LineChart({ 
  data, 
  xScaleType = "point", 
  xLegend = "X", 
  yLegend = "Y" 
}: LineChartProps) {

  console.log("xScaleType:", xScaleType);
  console.log("First x value:", data[0]?.data[0]?.x, typeof data[0]?.data[0]?.x);

  return (
    <div style={{ height: 550 }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 40, right: 40, bottom: 100, left: 70 }}

        xScale={
          xScaleType === "time"
            ? { type: "time", format: "native", precision: "second" }
            : { type: "point" }
        }

        xFormat={xScaleType === "time" ? "time:%H:%M:%S" : undefined}

        yScale={{ type: "linear", min: 0, max: "auto" }}

        axisBottom={{
          format: xScaleType === "time" ? "%H:%M:%S" : undefined,
          tickRotation: -45,
          tickPadding: 10,
          tickSize: 5,
          legend: xLegend,
          legendOffset: 70,
          legendPosition: "middle",
        }}
        
        axisLeft={{ 
          legend: yLegend, 
          legendOffset: -55,
          legendPosition: "middle"
        }}
        
        colors={{ scheme: "category10" }}
        pointSize={8}
        useMesh
        enableSlices="x"
      />
    </div>
  );
}

export default LineChart;