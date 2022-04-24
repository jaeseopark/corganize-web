import HighlightManager from "bizlog/HighlightManager";
import React, { Dispatch, useContext, useReducer } from "react";
import { Multimedia } from "typedefs/CorganizeFile";
import { createRange } from "utils/arrayUtils";

type Mode = "grid" | "grid-bulk-highlight" | "lightbox";
export type GalleryState = {
  sources: string[];
  index: number;
  mode: Mode;
  highlights: number[];
};

export type GalleryAction =
  | { type: "SET_MODE"; payload: Mode }
  | { type: "SET_INDEX"; payload: number }
  | { type: "SET_HIGHLIGHTS"; payload: number[] };

export type GalleryContextProps = {
  state: GalleryState;
  dispatch?: Dispatch<GalleryAction>;
  updateMultimedia: (p: Partial<Multimedia>) => Promise<void>;
};

export const initialState: GalleryState = {
  highlights: [],
  mode: "grid",
  sources: [],
  index: 0,
};

const reducer = (state: GalleryState, action: GalleryAction) => {
  switch (action.type) {
    case "SET_INDEX":
      return {
        ...state,
        index: action.payload,
      };
    case "SET_MODE":
      return {
        ...state,
        mode: action.payload,
      };
    case "SET_HIGHLIGHTS":
      return {
        ...state,
        highlights: action.payload,
      };
    default:
      return state;
  }
};

export const useGalleryReducer = (initialState: GalleryState) => useReducer(reducer, initialState);

export const useGalleryContext = (context: React.Context<GalleryContextProps>) => {
  const {
    state: { sources, index, mode, highlights },
    dispatch,
    updateMultimedia,
  } = useContext(context);

  const highlightManager = new HighlightManager(Array.from(highlights));

  const setIndex = (newIndex: number) => {
    if (newIndex < 0) {
      dispatch!({ type: "SET_INDEX", payload: 0 });
    } else if (newIndex >= sources.length) {
      dispatch!({ type: "SET_INDEX", payload: sources.length - 1 });
    } else {
      dispatch!({ type: "SET_INDEX", payload: newIndex });
    }
  };

  const incrementIndexWithWraparound = (delta: number) =>
    setIndex((index + delta) % sources.length);

  const incrementIndex = (delta: number) => setIndex(index + delta);

  const enterMode = (newMode: Mode) => {
    let p = Promise.resolve();
    if (newMode === mode) return p;

    if (mode === "grid-bulk-highlight") {
      p = updateMultimedia!({ highlights: highlightManager.toString() });
    }
    return p.then(() => dispatch!({ type: "SET_MODE", payload: newMode }));
  };

  const jumpToNextSnippet = () => {
    if (!highlightManager.isEmpty()) {
      const nextIndex = highlightManager.next(index);
      if (nextIndex && nextIndex !== 0) {
        dispatch!({ type: "SET_INDEX", payload: nextIndex });
      }
    } else {
      incrementIndexWithWraparound(Math.floor(sources.length / 10));
    }
  };

  const enterLightboxMode = () => enterMode("lightbox");
  const enterGridMode = () => enterMode("grid");
  const enterHighlightMode = () => enterMode("grid-bulk-highlight");

  const toggleHighlightByIndex = (i: number) =>
    dispatch!({ type: "SET_HIGHLIGHTS", payload: highlightManager.toggle(i).highlights });

  const toggleHighlight = () => toggleHighlightByIndex(index);

  const toggleAllHighlights = () => {
    const shouldClear = highlightManager.highlights.length === sources.length;
    const payload = shouldClear ? [] : createRange(0, sources.length - 1);
    dispatch!({ type: "SET_HIGHLIGHTS", payload });
  };

  return {
    sourceProps: {
      sources,
      selectedSource: sources[index],
    },
    indexProps: {
      index,
      incrementIndex,
      setIndex,
      jumpToNextSnippet,
      toggleHighlight,
      toggleHighlightByIndex,
      toggleAllHighlights,
      highlights,
    },
    modeProps: {
      mode,
      enterLightboxMode,
      enterGridMode,
      enterHighlightMode,
    },
  };
};
