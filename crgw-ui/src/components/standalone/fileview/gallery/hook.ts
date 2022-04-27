import { useEffect, useState } from "react";

import { Multimedia } from "typedefs/CorganizeFile";

import { useToast } from "providers/toast/hook";

import HighlightManager from "bizlog/HighlightManager";

import { createRange, sample } from "utils/arrayUtils";

export const SUMMARY_MODE_LIMIT = 20;

export type Mode = "lightbox" | "summary" | "thumbnail" | "edit";

export const useGallery = (
  srcs: string[],
  updateMultimedia: (newProps: Partial<Multimedia>) => Promise<void>,
  highlightsSeed?: string
) => {
  const { enqueue } = useToast();
  const [mode, setMode] = useState<Mode>("thumbnail");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlights, setHighlights] = useState<number[]>([]);

  const hm = HighlightManager.fromHighlights(highlights);

  useEffect(() => {
    setHighlights(new HighlightManager(highlightsSeed).highlights);
  }, [highlightsSeed]);

  const toggleHighlight = (index: number) => {
    hm.toggle(index);
    setHighlights(hm.highlights);
  };

  const toggleHighlightOnCurrentIndex = () => toggleHighlight(currentIndex);

  const toggleAllHighlights = () => {
    const shouldClear = highlights.length === srcs.length;
    const newHighlights = shouldClear ? [] : createRange(0, srcs.length - 1);
    setHighlights(newHighlights);

    const de = shouldClear ? "de" : "";
    enqueue({ message: `All Images have been ${de}highlighted.` });
  };

  const setIndex = (newIndex: number) => {
    if (newIndex < 0) {
      setCurrentIndex(0);
    } else if (newIndex >= srcs.length) {
      setCurrentIndex(srcs.length - 1);
    } else {
      setCurrentIndex(newIndex);
    }
  };

  const incrementIndexWithWraparound = (delta: number) => {
    let i = (currentIndex + delta) % srcs.length;
    setIndex(i);
  };

  const incrementIndex = (delta: number) => setIndex(currentIndex + delta);

  const setNextHighlightIndex = () => {
    if (highlights.length > 0) {
      setIndex(hm.next(currentIndex)!);
    } else if (srcs.length <= 10) {
      incrementIndexWithWraparound(1);
    } else {
      // 10% increment or +1 (if srcs.length)
      const delta = Math.floor(srcs.length / 10);
      incrementIndexWithWraparound(delta);
    }
  };

  const isHighlighted = (i: number) => {
    // The highlight effect makes images stand out by making other images less opaque.
    // If nothing is highlighted, you end up with a foggy look in the entire gallery.
    // To prevent this, consider highlights.length as well.
    return highlights.length === 0 || highlights.includes(i);
  };

  const rotateModes = () => {
    if (mode !== "lightbox") {
      return safelySetMode("lightbox");
    }

    safelySetMode("thumbnail");
  };

  const safelySetMode = (newMode: Mode) => {
    if (mode === newMode) {
      return;
    }

    if (mode === "edit") {
      return finalizeHighlights().then(() => setMode(newMode));
    }

    setMode(newMode);
  };

  const getRenderableImageUrls = () => {
    if (mode !== "summary") {
      return srcs;
    }

    let indices: number[] = createRange(0, srcs.length, 1, false);
    if (highlights.length > 0) {
      indices = highlights;
    }

    return sample(indices, SUMMARY_MODE_LIMIT, false).map((i) => srcs[i]);
  };

  const enterThumbnailMode = () => safelySetMode("thumbnail");
  const enterLightboxMode = () => safelySetMode("lightbox");
  const enterSummaryMode = () => safelySetMode("summary");
  const enterEditMode = () => safelySetMode("edit");
  const toggleEditMode = () => {
    if (mode !== "edit") {
      return safelySetMode("edit");
    }
    safelySetMode("thumbnail");
  };

  const finalizeHighlights = () => {
    const newMultimedia = { highlights: hm.toString() };
    return updateMultimedia(newMultimedia)
      .then(() => enqueue({ message: "Highlights saved" }))
      .then(() => setMode("thumbnail"));
  };

  return {
    basicProps: {
      imageUrls: getRenderableImageUrls(),
      currentIndex,
      incrementIndex,
      setIndex,
      incrementIndexWithWraparound,
    },
    modeProps: {
      mode,
      enterThumbnailMode,
      enterLightboxMode,
      enterSummaryMode,
      enterEditMode,
      toggleEditMode,
      rotateModes,
    },
    highlightProps: {
      highlights,
      isHighlighted,
      setNextHighlightIndex,
      toggleAllHighlights,
      toggleHighlightOnCurrentIndex,
      finalizeHighlights,
    },
  };
};

export type GalleryProps = ReturnType<typeof useGallery>;
export type GalleryRenderer = (props: GalleryProps) => JSX.Element | null;
