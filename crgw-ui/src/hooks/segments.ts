import { useState } from "react";

import { Segment } from "typedefs/Segment";

const isOpen = (s?: Segment) => s && s.end === undefined;

export const getTotalDuration = (segments: Segment[]) =>
  segments.filter((s) => !isOpen(s)).reduce((acc, next) => acc + (next.end! - next.start), 0);

export const useSegments = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const lastSegment = [...segments].pop();
  const isLastSegmentOpen = isOpen(lastSegment);

  const open = (t: number) => {
    if (!isLastSegmentOpen) {
      const newSegemnt = { start: t };
      setSegments([...segments, newSegemnt]);
      return;
    }

    lastSegment!.start = t;
    setSegments([...segments]);
  };

  const close = (t: number) => {
    if (!isLastSegmentOpen) {
      throw new Error("Nothing to close");
    }

    if (lastSegment!.start >= t) {
      throw new Error("Negative duration");
    }

    lastSegment!.end = t;
    setSegments([...segments]);
  };

  return {
    segments,
    closedSegments: segments.filter((s) => !isOpen(s)),
    open,
    close,
  };
};
