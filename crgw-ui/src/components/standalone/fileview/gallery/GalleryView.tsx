import React, { createContext, useEffect, useRef, useState } from "react";
import { getObjectUrls } from "utils/zipUtils";

import { Multimedia } from "typedefs/CorganizeFile";
import { FileViewComponentProps } from "components/standalone/fileview/types";
import { expand } from "bizlog/HighlightManager";

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

const ErrorDisplay = ({ error }: { error: Error }) => {
  if (!error) {
    return null;
  }
  return (
    <p className="error" tabIndex={1}>
      {error.message}
    </p>
  );
};

const GalleryViewWithContext = ({ context }: { context: React.Context<GalleryContextProps> }) => {
  const mainref = useRef<HTMLDivElement | null>(null);
  const {
    sourceProps: { sources },
    indexProps: { incrementIndex, setIndex },
  } = useGalleryContext(context);

  const handleGlobalKey = (key: string) => {
    const delta = SEEK_HOTKEY_MAP[key];
    if (delta) {
      incrementIndex(delta);
    } else if (key >= "0" && key <= "9") {
      const newIndex = Math.floor((sources.length * parseInt(key)) / 10);
      setIndex(newIndex);
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
    </div>
  );
};

const GalleryViewWithContextProps = ({ contextProps }: { contextProps: GalleryContextProps }) => {
  const GalleryContext = createContext<GalleryContextProps>(contextProps);
  const [state, dispatch] = useGalleryReducer(contextProps.state);
  const { updateMultimedia } = contextProps;

  return (
    <GalleryContext.Provider value={{ state, dispatch, updateMultimedia }}>
      <GalleryViewWithContext context={GalleryContext} />
    </GalleryContext.Provider>
  );
};

const GalleryView = (props: FileViewComponentProps) => {
  const {
    updateFile,
    file: { multimedia, streamingurl },
  } = props;

  const [sources, setSources] = useState<string[]>();
  const [error, setError] = useState<Error>();

  const updateMultimedia = (p: Partial<Multimedia>) => {
    return updateFile({
      multimedia: {
        ...(multimedia || {}),
        ...p,
      },
    });
  };

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

    return () => {
      if (sources) {
        sources.forEach(URL.revokeObjectURL);
      }
    };
  }, []);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!sources) {
    return null;
  }

  return (
    <GalleryViewWithContextProps
      contextProps={{
        state: {
          ...initialState,
          highlights: expand(multimedia?.highlights),
          sources,
        },
        updateMultimedia,
      }}
    />
  );
};

export default GalleryView;
