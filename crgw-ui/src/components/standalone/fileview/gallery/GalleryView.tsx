import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { getObjectUrls } from "utils/zipUtils";

import { Multimedia } from "typedefs/CorganizeFile";
import { FileViewComponentProps } from "components/standalone/fileview/types";
import HighlightManager from "bizlog/HighlightManager";

import { GalleryContextProps, initialState, useGalleryContext, useGalleryReducer } from "./state";
import GalleryGridView from "./GalleryGridView";
import Lightbox from "./Lightbox";

import "./GalleryView.scss";

const SEEK_HOTKEY_MAP: { [key: string]: number } = {
  "[": -10000,
  z: -10,
  x: -5,
  arrowleft: -1,
  arrowright: 1,
  c: 5,
  v: 10,
  "]": 10000,
};

const ErrorDisplay = ({ error }: { error?: Error }) => {
  if (!error) {
    return null;
  }
  return (
    <p className="error" tabIndex={1}>
      {error.message}
    </p>
  );
};

const GalleryViewWithContext = ({
  file: { multimedia, streamingurl },
  updateFile,
  context,
}: FileViewComponentProps & { context: React.Context<GalleryContextProps> }) => {
  const {
    sourceProps: { sources, setSources },
    indexProps: { addIndex, setIndex, jumpToNextHighlight },
    modeProps: { enterLightboxMode },
  } = useGalleryContext(context);
  const [error, setError] = useState<Error>();

  const mainref = useRef();

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
          throw new Error("No images");
        }
        updateMultimedia({ filecount: sourcePaths.length });
        return sourcePaths;
      })
      .then(setSources)
      .catch(setError);

    return () => sources.forEach(URL.revokeObjectURL);
  }, []);

  const handleGlobalKey = (key: string) => {
    const delta = SEEK_HOTKEY_MAP[key];
    if (delta) {
      addIndex(delta);
    } else if (key >= "0" && key <= "9") {
      const newIndex = Math.floor((sources.length * parseInt(key)) / 10);
      setIndex(newIndex);
    } else if (key === "`") {
      jumpToNextHighlight();
    } else if (key === "e") {
      enterLightboxMode();
      addIndex(Math.floor(sources.length / 10));
    }
  };

  return (
    <div
      className="zip-view"
      tabIndex={1}
      onKeyDown={(e) => handleGlobalKey(e.key.toLowerCase())}
      ref={mainref}
    >
      <GalleryGridView context={context} />
      <Lightbox context={context} />
      <ErrorDisplay error={error} />
    </div>
  );
};

const GalleryView = (props: FileViewComponentProps) => {
  const { updateFile } = props;
  const GalleryContext = createContext<GalleryContextProps>({
    state: initialState,
    updateFile,
  });

  const [state, dispatch] = useGalleryReducer();

  return (
    <GalleryContext.Provider value={{ state, dispatch }}>
      <GalleryViewWithContext {...props} context={GalleryContext} />
    </GalleryContext.Provider>
  );
};

export default GalleryView;
