import { Flex } from "@chakra-ui/react";
import { useCallback, useMemo, useRef, useState } from "react";

import { CorganizeFile, Multimedia } from "typedefs/CorganizeFile";
import { Segment } from "typedefs/Segment";
import { Dictionary } from "typedefs/common";

import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import { useSegments } from "hooks/segments";

import HighlightManager from "bizlog/HighlightManager";

import { madFocus } from "utils/elementUtils";
import { toHumanDuration } from "utils/numberUtils";

import SegmentsView from "components/standalone/fileview/video/SegmentsView";

import "./VideoView.scss";

const DEFAULT_MIMETYPE = "video/mp4";
const SEEK_HOTKEY_MAP: Dictionary<number> = {
  z: 3,
  x: 15,
  c: 30,
  v: 60,
};

const ONE_HOUR = 3600000;

const VideoView = ({ fileid }: { fileid: string }) => {
  const { findById, updateFile, postprocesses } = useFileRepository();
  const { multimedia, streamingurl, mimetype, size } = findById(fileid);
  const { openSegment, closedSegments, segmentActions } = useSegments();
  const [currentTime, setCurrentTime] = useState<number>();
  const vidRef = useRef<HTMLVideoElement | null>(null);

  const { enqueue, enqueueSuccess, enqueueWarning, enqueueError, dequeue } = useToast();
  const highlightManager: HighlightManager = useMemo(
    () => new HighlightManager(multimedia?.highlights),
    [multimedia]
  );

  const updateMultimedia = useCallback(
    (newProps: Partial<Multimedia>) => {
      const m = {
        ...(multimedia || {}),
        ...newProps,
      };
      return updateFile({
        fileid,
        multimedia: m,
      });
    },
    [multimedia, updateFile, fileid]
  );

  const onMetadata = (e: any) => {
    const { videoWidth, videoHeight, duration } = e.target;

    madFocus(e.target);

    const isUpToDate =
      videoWidth === multimedia?.width &&
      videoHeight === multimedia?.height &&
      duration === multimedia?.duration;

    if (isUpToDate) {
      return enqueue({ message: "Multimedia metadata already up to date" });
    }

    return updateMultimedia({
      width: videoWidth,
      height: videoHeight,
      duration: Math.ceil(duration),
    }).then(() => enqueueSuccess({ message: "Multimedia metadata updated" }));
  };

  const postprocessSegments = async (
    name: string,
    func: (fileid: string, segments: Segment[]) => Promise<CorganizeFile[]>
  ) => {
    if (closedSegments.length === 0) {
      enqueueWarning({ message: "Need segments" });
      return;
    }

    const initialToastId = enqueue({ header: name, message: "In progress", duration: ONE_HOUR });

    try {
      console.time("postprocess");
      await func(fileid, closedSegments);
      console.timeEnd("postprocess");
      enqueueSuccess({ header: name, message: "Complete" });
    } catch (e) {
      const message = (e as Error).message || "Unknown reason";
      enqueueError({ header: name, message });
    } finally {
      dequeue(initialToastId);
    }
  };

  const trim = () => postprocessSegments("Trim", postprocesses.trim);

  const cut = () => postprocessSegments("Cut", postprocesses.cut);

  const jumpTo = (time: number) => {
    if (vidRef.current) vidRef.current.currentTime = time;
  };

  const onKeyDown = (e: any) => {
    const { target: vid, shiftKey, ctrlKey } = e;
    const key = e.key.toLowerCase();

    if (ctrlKey) return;

    const addHighlight = () => {
      highlightManager.add(Math.floor(vid.currentTime));
      updateMultimedia({ highlights: highlightManager.toString() }).then(() =>
        enqueueSuccess({
          message: `Highlight added: ${toHumanDuration(vid.currentTime)}`,
        })
      );
    };

    const jumpTimeByDelta = (deltaInSeconds: number) => jumpTo(vid.currentTime + deltaInSeconds);

    const jumptToNextHighlight = () => {
      const nextHighlight = highlightManager.next(vid.currentTime);
      if (nextHighlight !== null) jumpTo(nextHighlight);
    };

    if (SEEK_HOTKEY_MAP[key]) {
      let delta = SEEK_HOTKEY_MAP[key];
      if (shiftKey) {
        delta *= -1;
      }
      return jumpTimeByDelta(delta);
    }

    if (key === "e") {
      if (highlightManager.isEmpty()) {
        jumpTimeByDelta(vid.duration / 10); // jump by 10%
      } else {
        jumptToNextHighlight();
      }
    } else if (key === "m") {
      vid.muted = !vid.muted;
    } else if (key === "b") {
      addHighlight();
    } else if (key >= "0" && key <= "9") {
      const percentage = parseInt(key) / 10;
      jumpTo(vid.duration * percentage);
    } else if (SEEK_HOTKEY_MAP[key]) {
      jumpTimeByDelta(SEEK_HOTKEY_MAP[key]);
    } else if (key === "[") {
      vid.currentTime = 0;
    } else if (key === "]") {
      vid.currentTime = vid.duration - 1;
      vid.pause();
    } else if (key === "i") {
      segmentActions.open(Math.floor(vid.currentTime));
    } else if (key === "o") {
      segmentActions.close(Math.floor(vid.currentTime));
    } else if (key === "t") {
      if (closedSegments.length === 1) {
        enqueueWarning({ message: "Can't use trim for one segment" });
        return;
      }
      trim();
    } else if (key === "y") {
      cut();
    }
  };

  return (
    <Flex className="video-view">
      <SegmentsView
        openSegment={openSegment}
        closedSegments={closedSegments}
        currentTime={currentTime}
        multimedia={multimedia}
        highlights={highlightManager.highlights}
        size={size}
        jumpToTime={jumpTo}
      />
      <video
        ref={vidRef}
        onKeyDown={onKeyDown}
        onLoadedMetadata={onMetadata}
        onTimeUpdate={(e) => {
          const newTime = (e.target as HTMLVideoElement).currentTime;
          if (Math.abs((currentTime || 0) - newTime) > 1) {
            // This if statement reduces the frequency of rerender.
            setCurrentTime(newTime);
          }
        }}
        muted
        autoPlay
        loop
        controls
        playsInline
      >
        <source src={streamingurl} type={mimetype || DEFAULT_MIMETYPE} />
      </video>
    </Flex>
  );
};

export default VideoView;
