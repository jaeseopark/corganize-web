import { ViewIcon } from "@chakra-ui/icons";
import { useCallback, useEffect, useRef, useState } from "react";

import { Multimedia } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import { getObjectUrls } from "utils/zipUtils";

import EditViewHOC from "components/standalone/fileview/gallery/EditView";
import Lightbox from "components/standalone/fileview/gallery/Lightbox";
import SummaryViewHOC from "components/standalone/fileview/gallery/SummaryView";
import Thumbnails from "components/standalone/fileview/gallery/Thumbnails";
import { GalleryRenderer, Mode, useGallery } from "components/standalone/fileview/gallery/hook";

import "./GalleryView.scss";

export const SEEK_HOTKEY_MAP: { [key: string]: number } = {
  "[": -10000,
  z: -10,
  x: -5,
  arrowleft: -1,
  arrowright: 1,
  c: 5,
  v: 10,
  "]": 10000,
};

const RENDERER_BY_MODE: Map<Mode, GalleryRenderer> = new Map([
  ["lightbox", Lightbox],
  ["thumbnail", Thumbnails],
  ["edit", EditViewHOC(Thumbnails)],
  ["summary", SummaryViewHOC(Thumbnails)],
]);

const GalleryView = ({ fileid }: { fileid: string }) => {
  const { findById, updateFile } = useFileRepository();
  const { multimedia, streamingurl } = findById(fileid);

  const { enqueue, enqueueSuccess } = useToast();
  const [unzippedUrls, setUnzippedUrls] = useState<string[]>([]);
  const [error, setError] = useState<Error>();
  const { upsertUserAction } = useBlanket();
  const mainref = useRef<HTMLDivElement | null>(null);

  const updateMultimedia = useCallback(
    (newProps: Partial<Multimedia>) => {
      const m = {
        filecount: newProps.filecount || multimedia?.filecount,
        highlights: newProps.highlights || multimedia?.highlights,
      };
      return updateFile({
        fileid,
        multimedia: m,
      });
    },
    [multimedia, updateFile]
  );

  const galleryProps = useGallery(unzippedUrls, updateMultimedia, multimedia?.highlights);
  const {
    basicProps: { imageUrls, incrementIndex, setIndex },
    modeProps: {
      mode,
      enterLightboxMode,
      enterEditMode,
      enterSummaryMode,
      toggleEditMode,
      rotateModes,
    },
  } = galleryProps;

  useEffect(() => {
    getObjectUrls(streamingurl)
      .then((sourcePaths: string[]) => {
        if (sourcePaths.length === 0) {
          throw new Error("No images");
        }

        if (sourcePaths.length !== multimedia?.filecount) {
          return updateMultimedia({ filecount: sourcePaths.length })
            .then(() => enqueueSuccess({ message: "Filecount updated" }))
            .then(() => sourcePaths);
        }

        enqueue({ message: "Filecount already up to date" });
        return sourcePaths;
      })
      .then(setUnzippedUrls)
      .catch(setError);

    return () => unzippedUrls.forEach(URL.revokeObjectURL);
  }, []);

  useEffect(() => {
    upsertUserAction({
      name: "Summary",
      icon: <ViewIcon />,
      onClick: enterSummaryMode,
    });
  }, [mode]);

  const handleKey = (key: string) => {
    if (Object.keys(SEEK_HOTKEY_MAP).includes(key)) {
      const delta = SEEK_HOTKEY_MAP[key];
      return incrementIndex(delta);
    } else if (key >= "0" && key <= "9") {
      const i = Math.floor((imageUrls.length * parseInt(key)) / 10);
      return setIndex(i);
    } else if (["a", "b"].includes(key)) {
      return enterEditMode();
    } else if (key === "enter") {
      return toggleEditMode();
    } else if (key === "e") {
      return enterLightboxMode();
    } else if (key === "g") {
      return rotateModes();
    }
  };

  if (error) {
    return <div ref={mainref}>{error.message}</div>;
  }

  const ChildComponent = RENDERER_BY_MODE.get(mode)!;

  return (
    <div
      className="zip-view"
      tabIndex={1}
      onKeyDown={(e) => handleKey(e.key.toLowerCase())}
      ref={mainref}
    >
      <ChildComponent {...galleryProps} />
    </div>
  );
};

export default GalleryView;
