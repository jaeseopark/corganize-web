import { ViewIcon } from "@chakra-ui/icons";
import { Ref, forwardRef, useCallback, useEffect, useState } from "react";

import { Multimedia } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import { getObjectUrls } from "utils/zipUtils";

import EditViewHOC from "components/standalone/fileview/gallery/EditView";
import Lightbox from "components/standalone/fileview/gallery/Lightbox";
import SummaryViewHOC from "components/standalone/fileview/gallery/SummaryView";
import Thumbnails from "components/standalone/fileview/gallery/Thumbnails";
import { Mode, useGallery } from "components/standalone/fileview/gallery/hook";

import "./GalleryView.scss";

const SEEK_HOTKEY_MAP: { [key: string]: { delta: number; isReversible?: boolean } } = {
  z: { delta: 1, isReversible: true },
  x: { delta: 3, isReversible: true },
  c: { delta: 5, isReversible: true },
  v: { delta: 10, isReversible: true },
  arrowleft: { delta: -1 },
  arrowright: { delta: 1 },
  "[": { delta: -10000 },
  "]": { delta: 10000 },
};

const getRendererByMode = (mode: Mode) => {
  switch (mode) {
    case "lightbox":
      return Lightbox;
    case "thumbnail":
      return Thumbnails;
    case "edit":
      return EditViewHOC(Thumbnails);
    case "summary":
      return SummaryViewHOC(Thumbnails);
    default:
      throw new Error("Unsupported");
  }
};

const GalleryView = forwardRef(({ fileid }: { fileid: string }, ref: Ref<HTMLDivElement>) => {
  const { findById, updateFile } = useFileRepository();
  const { multimedia, streamingurl } = findById(fileid);

  const { enqueue, enqueueSuccess } = useToast();
  const [unzippedUrls, setUnzippedUrls] = useState<string[]>([]);
  const [error, setError] = useState<Error>();
  const { upsertUserAction } = useBlanket();

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
    [multimedia, updateFile],
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

  const handleKey = (key: string, shiftKey: boolean) => {
    if (Object.keys(SEEK_HOTKEY_MAP).includes(key)) {
      const { delta, isReversible } = SEEK_HOTKEY_MAP[key];
      return incrementIndex(delta * (shiftKey && isReversible ? -1 : 1));
    }

    if (shiftKey) return;

    if (key >= "0" && key <= "9") {
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
    return <div ref={ref}>{error.message}</div>;
  }

  const ChildComponent = getRendererByMode(mode)!;

  return (
    <div
      className="zip-view"
      tabIndex={1}
      onKeyDown={(e) => {
        if (e.metaKey || e.ctrlKey) return;
        handleKey(e.key.toLowerCase(), e.shiftKey);
      }}
    >
      <ChildComponent {...galleryProps} ref={ref} />
    </div>
  );
});

export default GalleryView;
