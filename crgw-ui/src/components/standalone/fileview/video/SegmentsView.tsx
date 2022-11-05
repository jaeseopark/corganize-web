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
  jumpToTime,
}: {
  openSegment?: Segment;
  closedSegments: Segment[];
  currentTime?: number;
  jumpToTime: (percent: number) => void;
} & Partial<CorganizeFile>) => {
  const duration = multimedia?.duration;

  if (!duration) {
    return null;
  }

  const getOpenSegment = () => {
    if (!openSegment || currentTime === undefined) {
      return null;
    }

    const { start } = openSegment;
    if (start >= currentTime) {
      return null;
    }

    return <OpenSegmentBlock start={start} currentTime={currentTime} duration={duration} />;
  };

  const getClosedSegments = () => (
    <>
      {closedSegments.map((s) => (
        <ClosedSegmentBlock key={s.start} segment={s} duration={duration} />
      ))}
    </>
  );

  const getSeeker = () => {
    if (currentTime === undefined) return null;
    return <Seeker currentTime={currentTime} duration={duration} />;
  };

  const getMarkers = () => {
    if (!duration) return null;
    return (
      <>
        {MARKERS.map((m) => (
          <TimeMarker key={m} value={m} onClick={() => jumpToTime((duration * m) / 10)} />
        ))}
      </>
    );
  };

  return (
    <div className="segments-view">
      {getClosedSegments()}
      {getOpenSegment()}
      {getMarkers()}
      {getSeeker()}
    </div>
  );
};

export default SegmentsView;
