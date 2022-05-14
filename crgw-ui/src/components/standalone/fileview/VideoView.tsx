import { useCallback, useMemo, useState } from "react";

import { Multimedia } from "typedefs/CorganizeFile";

import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import HighlightManager from "bizlog/HighlightManager";

import { madFocus } from "utils/elementUtils";
import { toHumanDuration, toHumanFileSize } from "utils/numberUtils";

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
  const { findById, updateFile, createSubclip } = useFileRepository();
  const { multimedia, streamingurl, mimetype, size } = findById(fileid);
  const [subclipStart, setSubclipStart] = useState<number>();

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

  const split = async (subclipEnd: number) => {
    if (subclipStart === undefined) {
      enqueueWarning({ message: "Mark the start time first" });
      return;
    }

    if (subclipEnd <= subclipStart) {
      enqueueWarning({ message: "Negative duration" });
      return;
    }

    const newDuration = subclipEnd - subclipStart;
    const newSize = (newDuration / multimedia?.duration!) * size!;

    const newDurationStr = toHumanDuration(newDuration);
    const newSizeStr = toHumanFileSize(newSize);

    enqueue({ header: "Split in progress", message: `${newDurationStr}, ${newSizeStr}` });
    try {
      await createSubclip(fileid, [subclipStart, subclipEnd]);
      enqueueSuccess({ message: "Split complete" });
    } catch (e) {
      const message = (e as Error).message || "Unknown reason";
      enqueueError({ header: "Split failed", message });
    } finally {
      setSubclipStart(undefined);
    }
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
      const t = Math.floor(vid.currentTime);
      setSubclipStart(t);
      enqueue({ message: `Start timestamp: ${t}` });
    } else if (key === "o") {
      split(Math.floor(vid.currentTime));
    }
  };

  return (
    <div className="video-view">
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
