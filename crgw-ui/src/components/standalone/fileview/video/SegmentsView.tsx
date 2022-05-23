import { CorganizeFile } from "typedefs/CorganizeFile";
import { Segment } from "typedefs/Segment";

import {
  ClosedSegmentBlock,
  Highlight,
  OpenSegmentBlock,
  Seeker,
  TimeMarker,
} from "components/standalone/fileview/video/SegmentBlock";

const MARKERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const SegmentsView = ({
  openSegment,
  closedSegments,
  currentTime,
  multimedia,
  highlights,
}: {
  openSegment?: Segment;
  closedSegments: Segment[];
  currentTime?: number;
  highlights: number[];
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

    return <OpenSegmentBlock start={start} currentTime={currentTime} duration={duration} />;
  };

  const ClosedSegments = () => (
    <>
      {closedSegments.map((s) => (
        <ClosedSegmentBlock key={s.start} segment={s} duration={duration} />
      ))}
    </>
  );

  const Seekerr = () => {
    if (currentTime === undefined) return null;
    return <Seeker currentTime={currentTime} duration={duration} />;
  };

  const Markers = () => {
    if (!duration) return null;
    return (
      <>
        {MARKERS.map((m) => (
          <TimeMarker key={m} value={m} />
        ))}
      </>
    );
  };

  const Highlights = () => {
    if (!duration) return null;
    return (
      <>
        {highlights.map((h) => (
          <Highlight timestamp={h} duration={duration} />
        ))}
      </>
    );
  };

  return (
    <div className="segments-view">
      <ClosedSegments />
      <OpenSegmentt />
      <Markers />
      <Highlights />
      <Seekerr />
    </div>
  );
};

export default SegmentsView;
