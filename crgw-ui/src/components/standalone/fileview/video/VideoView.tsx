import { useCallback, useMemo } from "react";

import { CorganizeFile, Multimedia } from "typedefs/CorganizeFile";
import { Segment } from "typedefs/Segment";

import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import { useSegments } from "hooks/segments";

import HighlightManager from "bizlog/HighlightManager";

import { madFocus } from "utils/elementUtils";
import { toHumanDuration } from "utils/numberUtils";

import SegmentsView from "components/standalone/fileview/video/SegmentsView";

import "./VideoView.scss";

const DEFAULT_MIMETYPE = "video/mp4";
const SEEK_HOTKEY_MAP: { [key: string]: number } = {
  z: -15,
  x: -3,
  c: 3,
  v: 15,
  b: 300,
};

const VideoView = ({ fileid }: { fileid: string }) => {
  const { findById, updateFile, postprocesses } = useFileRepository();
  const { multimedia, streamingurl, mimetype, size } = findById(fileid);
  const { openSegments, closedSegments, segmentActions } = useSegments();

  const { enqueue, enqueueSuccess, enqueueWarning, enqueueError } = useToast();
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
    [multimedia, updateFile]
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

  const openSegmentt = (t: number) => {
    segmentActions.open(t);
    enqueue({ message: `Start: ${t}` });
  };

  const closeSegmentt = (t: number) => {
    try {
      segmentActions.close(t);
      enqueue({ message: `End: ${t}` });
    } catch (e) {
      enqueueWarning({ message: (e as Error).message });
    }
  };

  const postprocessSegments = async (
    name: string,
    func: (fileid: string, segments: Segment[]) => Promise<CorganizeFile[]>
  ) => {
    if (closedSegments.length === 0) {
      enqueueWarning({ message: "Need segments" });
      return;
    }

    enqueue({ header: name, message: "In progress" });

    try {
      await func(fileid, closedSegments);
      enqueueSuccess({ header: name, message: "Complete" });
    } catch (e) {
      const message = (e as Error).message || "Unknown reason";
      enqueueError({ header: name, message });
    }
  };

  const trim = () => postprocessSegments("Trim", postprocesses.trim);

  const cut = () => postprocessSegments("Cut", postprocesses.cut);

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

    if (shiftKey) {
      if (SEEK_HOTKEY_MAP[key]) {
        jumpTimeByDelta(SEEK_HOTKEY_MAP[key] * 2);
      } else {
        return;
      }
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
      jumpTimeByPercentage(parseInt(key, 10) / 10);
    } else if (SEEK_HOTKEY_MAP[key]) {
      jumpTimeByDelta(SEEK_HOTKEY_MAP[key]);
    } else if (key === "[") {
      vid.currentTime = 0;
    } else if (key === "i") {
      openSegmentt(Math.floor(vid.currentTime));
    } else if (key === "o") {
      closeSegmentt(Math.floor(vid.currentTime));
      // } else if (key === "t") {
      //   trim();
    } else if (key === "y") {
      cut();
    }
  };

  return (
    <div className="video-view">
      <SegmentsView
        openSegments={openSegments}
        closedSegments={closedSegments}
        multimedia={multimedia}
        size={size}
      />
      <video
        onKeyDown={onKeyDown}
        onLoadedMetadata={onMetadata}
        muted
        autoPlay
        loop
        controls
        playsInline
        webkit-playsinline
      >
        <source src={streamingurl} type={mimetype || DEFAULT_MIMETYPE} />
      </video>
    </div>
  );
};

export default VideoView;
