import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import screenfull from "screenfull";
import cls from "classnames";
import LinearProgress from "@material-ui/core/LinearProgress";

import { getPosixMilliseconds } from "../../utils/dateUtils";

import { createRange } from "../../utils/arrayUtils";

import "./GalleryView.scss";
import { CorganizeFile, Multimedia } from "../../typedefs/CorganizeFile";
import HighlightManager from "../../bizlog/HighlightManager";
import Butt from "../reusable/Button";
import { useToast } from "../../providers/Toast";
import { getObjectUrls } from "../../utils/zipUtils";

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
  isHighlighted: boolean;
  isSelected: boolean;
  onClick: () => void;
};

const Img = forwardRef(
  ({ src, isHighlighted, isSelected, onClick }: ImgProps, ref) => {
    const c = cls({ selected: isSelected, highlighted: isHighlighted });
    return (
      // @ts-ignore
      <img className={c} src={src} alt={src} onClick={onClick} ref={ref} />
    );
  }
);

type GalleryViewProps = {
  zipPath: string;
  multimedia?: Multimedia;
  updateFile: (f: CorganizeFile) => Promise<CorganizeFile>;
};

const GalleryView = ({ zipPath, updateFile, multimedia }: GalleryViewProps) => {
  const { enqueue } = useToast();
  const [srcs, setSrcs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setBlanket] = useState(false);
  const [isBulkHighlightMode, setBulkHighlightMode] = useState(false);
  const [, setLastBulkHighlightActivity] = useState(getPosixMilliseconds());
  const highlightManager = useMemo(
    () => new HighlightManager(multimedia?.highlights),
    [multimedia]
  );
  const mainref = useRef();
  const selectedImgRef = useRef();

  const updateMultimedia = useCallback(
    (newProps: Multimedia) => {
      const getNewMultimedia = () => {
        if (!multimedia) return newProps;
        return { ...multimedia, ...newProps };
      };

      // @ts-ignore
      return updateFile({
        multimedia: getNewMultimedia(),
      });
    },
    [multimedia, updateFile]
  );

  useEffect(() => {
    if (srcs.length === 0) {
      getObjectUrls(zipPath)
        .then((sourcePaths: string[]) => {
          if (sourcePaths.length === 0) {
            setErrorMessage("No images");
            return [];
          }
          updateMultimedia({ filecount: sourcePaths.length });
          return sourcePaths;
        })
        .then(setSrcs)
        .catch((err: Error) => setErrorMessage(err.message));

      return () => srcs.forEach(URL.revokeObjectURL);
    }
  }, [srcs, updateMultimedia, zipPath]);

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
    if (!showLightbox && element && (element as any) instanceof HTMLElement) {
      (element as HTMLElement).scrollIntoView();
    }
  }, [currentIndex, showLightbox]);

  const rerender = () => setLastBulkHighlightActivity(getPosixMilliseconds());

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
    }).then(() => enqueue("Gallery", "Highlights saved"));

  const toggleFullscreen = () => {
    if (screenfull.isEnabled && mainref?.current) {
      setBlanket(!isFullscreen);
      screenfull.toggle(mainref.current);
    }
  };

  const toggleLightbox = () => setShowLightbox(!showLightbox);

  const toggleBulkHighlightMode = () => {
    if (isBulkHighlightMode) {
      setBulkHighlightMode(false);
      saveHighlights();
    } else {
      setShowLightbox(false);
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

  // @ts-ignore
  const onKeyDown = (event) => {
    const key = event.key.toLowerCase();
    if (key === "f") {
      toggleFullscreen();
    } else if (key === "g") {
      if (isBulkHighlightMode) {
        return enqueue("Error", "You must exit Bulk mode first");
      }
      toggleLightbox();
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
    } else if (!isBulkHighlightMode && !showLightbox && key === " ") {
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
    if (showLightbox) {
      return (
        <div className="lightbox-with-progress">
          <LinearProgress
            variant="determinate"
            value={((currentIndex + 1) * 100) / srcs.length}
          />
          <div className="lightbox">
            {
              // @ts-ignore
              <Img src={srcs[currentIndex]} />
            }
          </div>
        </div>
      );
    }
    return null;
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
    if (showLightbox) return null;
    return (
      <div className="zip-grid">
        {srcs.map((imgSrc, i) => {
          return (
            <Img
              src={imgSrc}
              key={imgSrc}
              isHighlighted={highlightManager.isHighlighted(i)}
              isSelected={i === currentIndex}
              ref={i === currentIndex ? selectedImgRef : null}
              onClick={() => {
                if (isBulkHighlightMode) {
                  toggleHighlight(i);
                }
              }}
            />
          );
        })}
      </div>
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

  const divCls = cls("zip-view", { windowed: !isFullscreen });

  return (
    // @ts-ignore
    <div className={divCls} tabIndex={1} onKeyDown={onKeyDown} ref={mainref}>
      {maybeRenderLightbox()}
      {maybeRenderBulkModeControls()}
      {maybeRenderGrid()}
    </div>
  );
};

export default GalleryView;
