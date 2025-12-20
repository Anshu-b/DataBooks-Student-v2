import { ResponsiveLine } from "@nivo/line";
import type { AggregatedTelemetryPoint } from "./types";

type Props = {
  data: AggregatedTelemetryPoint[];
};

function InfectionOverTimeCadets({ data }: Props) {
  const lineData = [
    {
      id: "Infected Cadets",
      data: data.map((d) => ({
        x: d.time,
        y: d.infectedCadets,
      })),
    },
  ];

  return (
    <div style={{ height: 400 }}>
      <ResponsiveLine
        data={lineData}
        margin={{ top: 40, right: 40, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0 }}
        axisBottom={{ legend: "Time" }}
        axisLeft={{ legend: "Infected Cadets" }}
        useMesh
      />
    </div>
  );
}

export default InfectionOverTimeCadets;
