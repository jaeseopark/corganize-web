import { Flex, useDisclosure, useMergeRefs } from "@chakra-ui/react";
import { forwardRef, useCallback, useMemo, useRef, useState } from "react";

import { Multimedia } from "typedefs/CorganizeFile";
import { Segment } from "typedefs/Segment";
import { Dictionary } from "typedefs/common";

import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import { useSegments } from "hooks/segments";

import { madFocus } from "utils/elementUtils";

import ReencodeModal from "components/standalone/fileview/video/ReencodeModal";
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

const VideoView = forwardRef(({ fileid }: { fileid: string }, ref) => {
  const { findById, updateFile, postprocesses } = useFileRepository();
  const { openSegment, closedSegments, segmentActions } = useSegments();
  const [currentTime, setCurrentTime] = useState<number>();
  const vidRef = useRef<HTMLVideoElement | null>(null);
  const { enqueue, enqueueSuccess, enqueueWarning, enqueueError, dequeue } = useToast();
  const {
    isOpen: isReencodeModalOpen,
    onOpen: openReencodeModal,
    onClose: closeReencodeModal,
  } = useDisclosure();
  const { multimedia, streamingurl, mimetype, size } = findById(fileid);
  const { width, height, duration } = useMemo(() => {
    if (multimedia) {
      return multimedia;
    }
    return { width: 0, height: 0, duration: 0 };
  }, [multimedia]);
  const multiRef = useMergeRefs(ref, vidRef);

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
    [multimedia, updateFile, fileid],
  );

  const onMetadata = ({ target }: any) => {
    const { videoWidth: newWidth, videoHeight: newHeight, duration: newduration } = target;

    madFocus(target);

    const isUpToDate =
      newWidth === width && newHeight === height && Math.ceil(newduration) === duration;

    if (isUpToDate) {
      return enqueue({ message: "Multimedia metadata already up to date" });
    }

    return updateMultimedia({
      width: newWidth,
      height: newHeight,
      duration: Math.ceil(newduration),
    }).then(() => enqueueSuccess({ message: "Multimedia metadata updated" }));
  };

  const postprocessSegments = async (
    name: string,
    func: (fileid: string, segments: Segment[]) => Promise<void>,
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

  const cutMerge = () => postprocessSegments("Cut Merge", postprocesses.cutMerge);

  const cut = () => postprocessSegments("Cut", postprocesses.cut);

  const jumpTo = (time: number) => {
    if (vidRef.current) vidRef.current.currentTime = time;
  };

  const onKeyDown = (e: any) => {
    const { target: vid, shiftKey, ctrlKey, metaKey } = e;
    const key = e.key.toLowerCase();

    if (ctrlKey || metaKey) return;

    const jumpTimeByDelta = (deltaInSeconds: number) => jumpTo(vid.currentTime + deltaInSeconds);

    if (SEEK_HOTKEY_MAP[key]) {
      let delta = SEEK_HOTKEY_MAP[key];
      if (shiftKey) {
        delta *= -1;
      }
      jumpTimeByDelta(delta);
    } else if (key === "e") {
      jumpTimeByDelta(vid.duration / 10); // jump by 10%
    } else if (key === "m") {
      vid.muted = !vid.muted;
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
        enqueueWarning({ message: "Need 2 or more segments" });
        return;
      }
      cutMerge();
    } else if (key === "|") {
      openReencodeModal();
    } else if (key === "y") {
      cut();
    }
  };

  return (
    <>
      <Flex className="video-view">
        <SegmentsView
          openSegment={openSegment}
          closedSegments={closedSegments}
          currentTime={currentTime}
          duration={duration}
          size={size}
          jumpToTime={jumpTo}
        />
        <video
          ref={multiRef}
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
      {width && height && (
        <ReencodeModal
          fileid={fileid}
          initialDimensions={[width, height]}
          isOpen={isReencodeModalOpen}
          close={closeReencodeModal}
        />
      )}
    </>
  );
});

export default VideoView;
