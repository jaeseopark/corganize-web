import { CorganizeFile } from "typedefs/CorganizeFile";
import { Segment } from "typedefs/Segment";

import SegmentBlock from "./SegmentBlock";

const SegmentsView = ({
  openSegment,
  closedSegments,
  currentTime,
  multimedia,
}: {
  openSegment?: Segment;
  closedSegments: Segment[];
  currentTime?: number;
} & Partial<CorganizeFile>) => {
  const duration = multimedia?.duration;

  if (!duration) {
    return null;
  }

  const OpenSegmentt = () => {
    if (!openSegment || currentTime === undefined) {
      return null;
    }

    const { start } = openSegment;
    if (start >= currentTime) {
      return null;
    }

    return <SegmentBlock segment={{ start, end: currentTime }} duration={duration} isOpen={true} />;
  };

  const ClosedSegments = () => (
    <>
      {closedSegments.map((s) => (
        <SegmentBlock key={s.start} segment={s} duration={duration} />
      ))}
    </>
  );

  const Seeker = () => {
    if (openSegment || currentTime === undefined) {
      // Do not render the seeker if there is an open segment because they deliver the same information to the user.
      return null;
    }

    return (
      <SegmentBlock
        segment={{ start: currentTime, end: currentTime + 1 }}
        duration={duration}
        isOpen={true}
      />
    );
  };

  return (
    <div className="segments-view">
      <ClosedSegments />
      <OpenSegmentt />
      <Seeker />
    </div>
  );
};

export default SegmentsView;
