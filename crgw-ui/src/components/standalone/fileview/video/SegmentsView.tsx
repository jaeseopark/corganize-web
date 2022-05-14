import { CorganizeFile } from "typedefs/CorganizeFile";
import { Segment } from "typedefs/Segment";

import SegmentBlock from "./SegmentBlock";

const SegmentsView = ({
  openSegments,
  closedSegments,
  multimedia,
  size,
}: { openSegments: Segment[]; closedSegments: Segment[] } & Partial<CorganizeFile>) => {
  const duration = multimedia?.duration;

  if (closedSegments.length === 0 || !duration || !size) {
    return null;
  }

  return (
    <div className="segments-view">
      {closedSegments.map((s) => (
        <SegmentBlock key={s.start} segment={s} duration={duration} />
      ))}
    </div>
  );
};

export default SegmentsView;
