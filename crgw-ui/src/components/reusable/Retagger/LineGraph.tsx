import React from "react";

export type GraphDataPoint = {
  timestamp: number;
  processed: number; // accumulative (since start) number of files processed
};

interface LineGraphProps {
  data: GraphDataPoint[];
}

const LineGraph: React.FC<LineGraphProps> = ({ data }) => {
  if (data.length === 0) return <div>No data yet</div>;

  const timestamps = data.map((d) => d.timestamp);
  const filesProcessed = data.map((d) => d.processed);
  const maxTime = Math.max(...timestamps);
  const maxFiles = Math.max(...filesProcessed);

  const width = 400;
  const height = 200;

  const points = data
    .map((d) => `${(d.timestamp / maxTime) * width},${height - (d.processed / maxFiles) * height}`)
    .join(" ");

  // Generate Y-axis scale points
  const scalePoints = [0, 0.25, 0.5, 0.75, 1];
  const scaleElements = scalePoints.map((ratio, index) => {
    const y = height - ratio * height;
    const fileValue = Math.round(ratio * maxFiles);
    return (
      <g key={index}>
        {/* Grid line */}
        <line
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#e0e0e0"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        {/* Scale label */}
        <text x={35} y={y + 4} fontSize="10" textAnchor="end" fill="#666">
          {fileValue}
        </text>
      </g>
    );
  });

  return (
    <svg width={width} height={height} style={{ border: "1px solid black" }}>
      {/* Y-axis scale */}
      {scaleElements}

      <polyline fill="none" stroke="blue" strokeWidth="2" points={points} />
      <text x={10} y={20} fontSize="12">
        Files processed over time
      </text>
      {/* Y-axis label */}
      <text
        x={15}
        y={height / 2}
        fontSize="12"
        textAnchor="middle"
        transform={`rotate(-90, 15, ${height / 2})`}
      >
        Files
      </text>
      {/* X-axis label */}
      <text x={width / 2} y={height - 5} fontSize="12" textAnchor="middle">
        Time (s)
      </text>
    </svg>
  );
};

export default LineGraph;
