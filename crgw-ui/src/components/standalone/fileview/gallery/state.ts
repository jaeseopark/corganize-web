import HighlightManager from "bizlog/HighlightManager";
import React, { Dispatch, useContext, useReducer } from "react";
import { UpdateFile } from "../types";

type Mode = "grid" | "grid-bulk-highlight" | "lightbox";
export type GalleryState = {
  sources: string[];
  i: number;
  mode: Mode;
  highlights: Set<number>;
};

export type GalleryAction =
  | { type: "SET_SOURCES"; payload: string[] }
  | { type: "SET_MODE"; payload: Mode }
  | { type: "SET_INDEX"; payload: number }
  | { type: "ADD_HIGHLIGHTS"; payload: number[] };

export type GalleryContextProps = {
  state: GalleryState;
  dispatch?: Dispatch<GalleryAction>;
  updateFile?: UpdateFile;
};

export const initialState: GalleryState = {
  highlights: new Set(),
  mode: "grid",
  sources: [],
  i: 0,
};

const reducer = (state: GalleryState, action: GalleryAction) => {
  switch (action.type) {
    case "SET_SOURCES":
      return {
        ...state,
        sources: action.payload,
      };
    case "SET_MODE": {
      return {
        ...state,
        mode: action.payload,
      };
    }
    case "ADD_HIGHLIGHTS":
      const newArray = [...Array.from(state.highlights), ...action.payload];
      return {
        ...state,
        highlights: new Set(newArray),
      };
    default:
      return state;
  }
};

export const useGalleryReducer = () => useReducer(reducer, initialState);

export const useGalleryContext = (context: React.Context<GalleryContextProps>) => {
  const {
    state: { sources, i, mode, highlights },
    dispatch,
    updateFile,
  } = useContext(context);

  const setSources = (sources: string[]) => dispatch!({ type: "SET_SOURCES", payload: sources });

  const setIndex = (newIndex: number) => {
    if (newIndex < 0) {
      dispatch!({ type: "SET_INDEX", payload: 0 });
    } else if (newIndex >= sources.length) {
      dispatch!({ type: "SET_INDEX", payload: sources.length - 1 });
    } else {
      dispatch!({ type: "SET_INDEX", payload: newIndex });
    }
  };

  const addIndex = (delta: number) => setIndex(i + delta);

  const enterMode = (newMode: Mode) => {
    let p = Promise.resolve();
    if (newMode === mode) return p;

    if (mode === "grid-bulk-highlight") {
      p = updateFile!({ multimedia: { highlights: new HighlightManager(highlight) } });
    }
    return p.then(() => dispatch!({ type: "SET_MODE", payload: newMode }));
  };

  const jumpToNextHighlight = () => {
    const nextIndex = hMan.next(i);
    if (nextIndex !== null) {
      dispatch!({ type: "SET_INDEX", payload: nextIndex });
    }
  };

  const enterLightboxMode = () => enterMode("lightbox");
  const enterGridMode = () => enterMode("grid");
  const enterHighlightMode = () => enterMode("grid-bulk-highlight");

  const handleLightboxKey = (key: string) => {
    if (key === "g") {
      enterGridMode();
    } else if (key === "a") {
      hMan.toggleAllHighlights();
      saveHighlights();
    } else if (key === "b") {
      toggleHighlight(currentIndex);
      saveHighlights();
    } else if (key === "enter") {
      enterHighlightMode();
    } else if (key === " ") {
      addIndex(1);
    }
  };

  const handleKey = (key: string) => {
    if (handleGlobalKey(key)) return;
    const func = new Map([
      ["grid", handleGridKey],
      ["lightbox", handleLightboxKey],
      ["grid-bulk-highlight", handleBulkKey],
    ]).get(mode)!;
    func(key);
  };

  return {
    keyProps: {
      handleKey,
    },
    sourceProps: {
      sources,
      selectedSource: sources[i],
      setSources,
    },
    indexProps: {
      index: i,
      addIndex,
      setIndex,
      jumpToNextHighlight,
      hMan,
    },
    modeProps: {
      mode,
      enterLightboxMode,
      enterGridMode,
      enterHighlightMode,
    },
  };
};
