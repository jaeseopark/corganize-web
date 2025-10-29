import React from "react";

interface LineGraphProps {
  data: { time: number; fps: number }[];
}

const LineGraph: React.FC<LineGraphProps> = ({ data }) => {
  if (data.length === 0) return <div>No data yet</div>;

  const times = data.map((d) => d.time);
  const fpss = data.map((d) => d.fps);
  const maxTime = Math.max(...times);
  const maxFps = Math.max(...fpss);

  const width = 400;
  const height = 200;

  const points = data
    .map((d) => `${(d.time / maxTime) * width},${height - (d.fps / maxFps) * height}`)
    .join(" ");

  return (
    <svg width={width} height={height} style={{ border: "1px solid black" }}>
      <polyline fill="none" stroke="blue" strokeWidth="2" points={points} />
      <text x={10} y={20} fontSize="12">
        FPS over time
      </text>
    </svg>
  );
};

export default LineGraph;