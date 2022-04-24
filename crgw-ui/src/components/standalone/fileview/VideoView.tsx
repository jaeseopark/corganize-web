import { useMemo, useRef, useState } from "react";

import { FileViewComponentProps } from "./types";
import { Multimedia } from "typedefs/CorganizeFile";
import { useToast } from "hooks/toast";
import { toHumanDuration } from "utils/numberUtils";
import HighlightManager from "bizlog/HighlightManager";

import "./VideoView.scss";

const SEEK_HOTKEY_MAP: { [key: string]: number } = {
  z: -15,
  x: -3,
  c: 3,
  v: 15,
  b: 300,
};

const VideoView = ({
  file: { multimedia: multimediaSeed, streamingurl },
  updateFile,
}: FileViewComponentProps) => {
  const mainref = useRef<HTMLDivElement | null>(null);
  const { enqueue } = useToast();
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [multimedia, setMultimedia] = useState<Multimedia>(multimediaSeed || {});
  const highlightManager: HighlightManager = useMemo(
    () => new HighlightManager(multimediaSeed?.highlights),
    [multimediaSeed]
  );

  const quarterRotation = () => setRotationDegrees(rotationDegrees + 90);
  const resetRotation = () => setRotationDegrees(0);

  const getNewMultimedia = (newProps: Multimedia) => {
    const newMultimedia = {
      ...multimedia,
      ...newProps,
    };
    setMultimedia(newMultimedia);
    return newMultimedia;
  };

  const onMetadata = (e: any) => {
    const { videoWidth, videoHeight, duration } = e.target;
    if (!videoWidth || !videoHeight || !duration) return;
    updateFile({
      multimedia: getNewMultimedia({
        width: videoWidth,
        height: videoHeight,
        duration: Math.ceil(duration),
      }),
    });
  };

  const onKeyDown = (e: any) => {
    const { target: vid, shiftKey } = e;
    const key = e.key.toLowerCase();

    const addHighlight = () => {
      highlightManager.add(Math.floor(vid.currentTime));
      updateFile({
        multimedia: getNewMultimedia({
          highlights: highlightManager.toString(),
        }),
      }).then(() =>
        enqueue({
          header: "Highlight",
          message: `Added: ${toHumanDuration(vid.currentTime)}`,
        })
      );
    };

    const jumpTimeByDelta = (deltaInSeconds: number) => {
      try {
        vid.currentTime += deltaInSeconds;
      } catch (e) {}
    };

    /**
     * @param percentage 0-1.0
     */
    const jumpTimeByPercentage = (percentage: number) => {
      try {
        vid.currentTime = vid.duration * percentage;
      } catch (e) {}
    };

    const jumptToNextHighlight = () => {
      const nextHighlight = highlightManager.next(vid.currentTime);
      if (nextHighlight !== null) vid.currentTime = nextHighlight;
    };

    if (key === "e") {
      if (highlightManager.isEmpty()) {
        jumpTimeByDelta(vid.duration / 10); // jump by 10%
      } else {
        jumptToNextHighlight();
      }
    } else if (key === "m") {
      vid.muted = !vid.muted;
    } else if (key === "r") {
      if (shiftKey) {
        resetRotation();
      } else {
        quarterRotation();
      }
    } else if (key === "b") {
      addHighlight();
    } else if (key >= "0" && key <= "9") {
      jumpTimeByPercentage(parseInt(key, 10) / 10);
    } else if (SEEK_HOTKEY_MAP[key]) {
      jumpTimeByDelta(SEEK_HOTKEY_MAP[key] * (shiftKey ? 2 : 1));
    } else if (key === "[") {
      vid.currentTime = 0;
    }
  };

  return (
    <div className="video-view" ref={mainref}>
      <video
        onKeyDown={onKeyDown}
        onLoadedMetadata={onMetadata}
        src={streamingurl}
        muted
        autoPlay
        loop
        controls
      />
    </div>
  );
};

export default VideoView;
