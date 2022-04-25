import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getObjectUrls } from "utils/zipUtils";
import { useUpdate } from "react-use";
import { Progress, Box, SimpleGrid } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import cls from "classnames";

import { FileViewComponentProps } from "../types";
import { Multimedia } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";
import { useToast } from "providers/toast/hook";
import { createRange, sample } from "utils/arrayUtils";
import HighlightManager from "bizlog/HighlightManager";

import Butt from "components/reusable/Button";

import "./GalleryView.scss";

const SUMMARY_MODE_LIMIT = 20;
const SEEK_HOTKEY_MAP: { [key: string]: number } = {
  "[": -10000,
  z: -10,
  x: -5,
  arrowleft: -1,
  " ": 1,
  arrowright: 1,
  c: 5,
  v: 10,
  "]": 10000,
};

type ImgProps = {
  src: string;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
};

const Img = forwardRef(({ src, isHighlighted, isSelected, onClick }: ImgProps, ref) => {
  const c = cls({ selected: isSelected, highlighted: isHighlighted });
  return (
    // @ts-ignore
    <img className={c} src={src} alt={src} onClick={onClick} ref={ref} />
  );
});

const GalleryView = ({
  file: { multimedia, streamingurl },
  updateFile,
}: FileViewComponentProps) => {
  const { enqueue, enqueueSuccess, enqueueError } = useToast();
  const [srcs, setSrcs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLightboxEnabled, setLightboxEnabled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBulkHighlightMode, setBulkHighlightMode] = useState(false);
  const [summarySrcs, setSummarySrcs] = useState<string[]>([]);
  const highlightManager = useMemo(
    () => new HighlightManager(multimedia?.highlights),
    [multimedia]
  );
  const { upsertUserAction } = useBlanket();
  const mainref = useRef();
  const selectedImgRef = useRef();
  const rerender = () => useUpdate();

  const updateMultimedia = useCallback(
    (newProps: Multimedia) => {
      const getNewMultimedia = () => {
        if (!multimedia) return newProps;
        return { ...multimedia, ...newProps };
      };

      return updateFile({
        multimedia: getNewMultimedia(),
      });
    },
    [multimedia, updateFile]
  );

  useEffect(() => {
    getObjectUrls(streamingurl)
      .then((sourcePaths: string[]) => {
        if (sourcePaths.length === 0) {
          setErrorMessage("No images");
          return [];
        }

        if (sourcePaths.length !== multimedia?.filecount) {
          return updateMultimedia({ filecount: sourcePaths.length })
            .then(() => enqueueSuccess({ message: "Filecount updated" }))
            .then(() => sourcePaths);
        }

        enqueue({ message: "Filecount already up to date" });
        return sourcePaths;
      })
      .then(setSrcs)
      .catch((err: Error) => setErrorMessage(err.message));

    return () => srcs.forEach(URL.revokeObjectURL);
  }, []);

  useEffect(() => {
    const focusElement = () => {
      if (mainref?.current) {
        (mainref.current as HTMLElement).focus();
      } else {
        setTimeout(focusElement, 250);
      }
    };
    focusElement();
  }, [errorMessage, srcs, isBulkHighlightMode]);

  useEffect(() => {
    const element = selectedImgRef?.current;
    if (!isLightboxEnabled && element && (element as any) instanceof HTMLElement) {
      (element as HTMLElement).scrollIntoView();
    }
  }, [currentIndex, isLightboxEnabled]);

  const isSummaryMode = summarySrcs.length > 0;
  const toggleSummaryMode = () => {
    if (isSummaryMode) {
      return setSummarySrcs([]);
    }

    let indices: number[] = createRange(0, srcs.length, 1, false);
    if (!highlightManager.isEmpty()) {
      indices = highlightManager.highlights;
    }
    setSummarySrcs(sample(indices, SUMMARY_MODE_LIMIT, false).map((i) => srcs[i]));
  };

  useEffect(() => {
    upsertUserAction({
      name: "Toggle Summary",
      icon: <ViewIcon />,
      onClick: toggleSummaryMode,
    });
  }, [srcs, isSummaryMode]);

  const toggleHighlight = (index: number) => {
    // The first line isn't going to cause a rerender because the pointers stay unchanged.
    highlightManager.toggle(index);
    rerender();
  };

  const toggleAllHighlights = () => {
    const shouldClear = highlightManager.highlights.length === srcs.length;
    if (shouldClear) {
      highlightManager.clear();
    } else {
      createRange(0, srcs.length - 1).forEach((i) => highlightManager.add(i));
    }
    rerender();
  };

  const saveHighlights = () =>
    updateMultimedia({
      highlights: highlightManager.toString(),
    }).then(() => enqueue({ header: "Highlight", message: "Saved" }));

  const toggleLightbox = () => setLightboxEnabled(!isLightboxEnabled);
  const enterLightbox = () => setLightboxEnabled(true);

  const toggleBulkHighlightMode = () => {
    if (isBulkHighlightMode) {
      setBulkHighlightMode(false);
      saveHighlights();
    } else {
      setLightboxEnabled(false);
      setBulkHighlightMode(true);
    }
  };

  const safeJump = (newIndex: number) => {
    if (newIndex < 0) {
      setCurrentIndex(0);
    } else if (newIndex >= srcs.length) {
      setCurrentIndex(srcs.length - 1);
    } else {
      setCurrentIndex(newIndex);
    }
  };

  const deltaJump = (delta: number) => safeJump(currentIndex + delta);

  const onKeyDown = (e: any) => {
    const key = e.key.toLowerCase();
    if (key === "g") {
      if (isBulkHighlightMode) {
        return enqueueError({
          message: "You must exit Bulk mode first",
        });
      }
      toggleLightbox();
    } else if (key === "e") {
      // jump by 10%
      enterLightbox();
      const i = currentIndex + Math.floor(srcs.length / 10);
      safeJump(i % srcs.length);
    } else if (key === "b") {
      toggleHighlight(currentIndex);
      if (!isBulkHighlightMode) {
        saveHighlights();
      }
    } else if (key === "a") {
      toggleAllHighlights();
      if (!isBulkHighlightMode) {
        saveHighlights();
      }
    } else if (key === "`") {
      const nextIndex = highlightManager.next(currentIndex);
      if (nextIndex !== null) setCurrentIndex(nextIndex);
    } else if (!isBulkHighlightMode && !isLightboxEnabled && key === " ") {
      toggleLightbox();
    } else if (key === "enter") {
      toggleBulkHighlightMode();
    } else if (key >= "0" && key <= "9") {
      const i = Math.floor((srcs.length * parseInt(key)) / 10);
      safeJump(i);
    } else if (SEEK_HOTKEY_MAP[key]) {
      deltaJump(SEEK_HOTKEY_MAP[key]);
    }
  };

  const maybeRenderLightbox = () => {
    if (!isLightboxEnabled) {
      return null;
    }

    return (
      <div className="lightbox-with-progress">
        <Progress value={(currentIndex * 100) / srcs.length} />
        <div className="lightbox">
          <Img src={srcs[currentIndex]} />
        </div>
      </div>
    );
  };

  const maybeRenderBulkModeControls = () => {
    if (!isBulkHighlightMode) return null;

    return (
      <div className="bulk-mode">
        <span>Bulk Highlight Mode</span>
        <Butt onClick={toggleAllHighlights}>Toggle All (A)</Butt>
        <Butt onClick={toggleBulkHighlightMode}>Exit (⏎)</Butt>
      </div>
    );
  };

  const maybeRenderGrid = () => {
    if (isLightboxEnabled) return null;

    let srcsToRender = srcs;
    if (isSummaryMode) {
      srcsToRender = summarySrcs;
    }

    return (
      <SimpleGrid
        minChildWidth={isSummaryMode ? "150px" : "400px"}
        spacing={isSummaryMode ? 2 : 6}
        tabIndex={1}
        className={cls({ "summary-mode": isSummaryMode })}
      >
        {srcsToRender.map((src, i) => (
          <Box key={src} bg="white">
            <Img
              src={src}
              isHighlighted={highlightManager.isHighlighted(i)}
              isSelected={i === currentIndex}
              ref={i === currentIndex ? selectedImgRef : null}
              onClick={() => {
                if (isBulkHighlightMode) {
                  toggleHighlight(i);
                }
              }}
            />
          </Box>
        ))}
      </SimpleGrid>
    );
  };

  if (errorMessage) {
    return (
      // @ts-ignore
      <p className="error" tabIndex={1} ref={mainref}>
        {errorMessage}
      </p>
    );
  }

  if (srcs.length === 0) {
    return null;
  }

  return (
    // @ts-ignore
    <div className="zip-view" tabIndex={1} onKeyDown={onKeyDown} ref={mainref}>
      {maybeRenderLightbox()}
      {maybeRenderBulkModeControls()}
      {maybeRenderGrid()}
    </div>
  );
};

export default GalleryView;
