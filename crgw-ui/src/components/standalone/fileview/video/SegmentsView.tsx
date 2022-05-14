import { CorganizeFile } from "typedefs/CorganizeFile";
import { Segment } from "typedefs/Segment";

import SegmentBlock from "./SegmentBlock";

const SegmentsView = ({
  segments,
  multimedia,
  size,
}: { segments: Segment[] } & Partial<CorganizeFile>) => {
  const duration = multimedia?.duration;

  if (segments.length === 0 || !duration || !size) {
    return null;
  }

  return (
    <div className="segments-view">
      {segments.map((s) => (
        <SegmentBlock key={s.start} segment={s} duration={duration} />
      ))}
    </div>
  );
};

export default SegmentsView;
