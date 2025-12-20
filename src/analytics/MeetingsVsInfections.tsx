import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import type { AggregatedTelemetryPoint } from "./types";

type Props = {
  data: AggregatedTelemetryPoint[];
};

function MeetingsVsInfections({ data }: Props) {
  const scatterData = [
    {
      id: "Meetings vs Infections",
      data: data.map((d) => ({
        x: d.meetingsHeld,
        y: d.infectedCadets,
      })),
    },
  ];

  return (
    <div style={{ height: 400 }}>
      <ResponsiveScatterPlot
        data={scatterData}
        margin={{ top: 40, right: 40, bottom: 50, left: 60 }}
        xScale={{ type: "linear" }}
        yScale={{ type: "linear" }}
        axisBottom={{ legend: "Meetings Held" }}
        axisLeft={{ legend: "Infected Cadets" }}
      />
    </div>
  );
}

export default MeetingsVsInfections;
