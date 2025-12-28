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

// import { ResponsiveLine } from "@nivo/line";

// type LineChartProps = {
//   data: {
//     id: string;
//     data: { x: number | string | Date; y: number }[];
//   }[];

//   xScaleType?: "point" | "time";
//   xFormat?: string;
//   xLegend?: string;
//   yLegend?: string;
// };

// function LineChart({ data, xScaleType = "point", xFormat, xLegend = "X", yLegend = "Y", }: LineChartProps) {
//   return (
//     <div style={{ height: 400 }}>
//       <ResponsiveLine
//         data={data}
//         margin={{ top: 40, right: 40, bottom: 50, left: 60 }}

//         xScale={
//           xScaleType === "time"
//             ? { type: "time", format: "native", precision: "second" }
//             : { type: "point" }
//         }
//         xFormat={xScaleType === "time" ? xFormat : undefined}

//         yScale={{ type: "linear", min: 0, max: "auto" }}

//         axisBottom={{
//           format: xScaleType === "time" ? xFormat : undefined,
//           legend: xLegend,
//           legendOffset: 36,
//           legendPosition: "middle",
//         }}
        
//         axisLeft={{ legend: "Y", legendOffset: -50 }}
//         colors={{ scheme: "category10" }}
//         pointSize={6}
//         useMesh
//       />
//     </div>
//   );
// }

// export default LineChart;

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
  return (
    <div style={{ height: 400 }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 40, right: 40, bottom: 50, left: 60 }}

        xScale={
          xScaleType === "time"
            ? { type: "time", format: "native", precision: "second" }
            : { type: "point" }
        }

        yScale={{ type: "linear", min: 0, max: "auto" }}

        axisBottom={{
          format: xScaleType === "time" ? "%H:%M:%S" : undefined,
          legend: xLegend,
          legendOffset: 36,
          legendPosition: "middle",
        }}
        
        axisLeft={{ 
          legend: yLegend, 
          legendOffset: -50,
          legendPosition: "middle"
        }}
        
        colors={{ scheme: "category10" }}
        pointSize={15}
        useMesh
        enableSlices="x"
      />
    </div>
  );
}

export default LineChart;
