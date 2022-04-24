import { useEffect, useRef, useState } from "react";

import { useFileRepository } from "hooks/fileRepository";
import { useToast } from "providers/toast/hook";

import VideoView from "components/standalone/fileview/VideoView";

import { madFocus } from "utils/elementUtils";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { FullScreen, useFullScreenHandle } from "react-full-screen";
import ToastPortal from "providers/toast/portal";

import "./FileView.scss";
import GalleryView from "./gallery/GalleryView";
import { useBlanket } from "hooks/blanket";
import { StarIcon } from "@chakra-ui/icons";

const COMPONENT_BY_MIMETYPE: Map<string, any> = new Map(); // TODO how to type JSX.Element?
COMPONENT_BY_MIMETYPE.set("video/mp4", VideoView);
COMPONENT_BY_MIMETYPE.set("video/x-matroska", VideoView);
COMPONENT_BY_MIMETYPE.set("video/x-m4v", VideoView);
COMPONENT_BY_MIMETYPE.set("video/quicktime", VideoView);
COMPONENT_BY_MIMETYPE.set("application/zip", GalleryView);

const FileView = ({ fileid }: { fileid: string }) => {
  const { findById, markAsOpened, updateFile, toggleFavourite } = useFileRepository();
  const [content, setContent] = useState<JSX.Element>();
  const handle = useFullScreenHandle();
  const { enqueue, enqueueError } = useToast();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { addUserAction } = useBlanket();

  const file = findById(fileid);
  const { mimetype, streamingurl } = file;

  const toggleFavouriteWithToast = () =>
    toggleFavourite(fileid).then(({ emoji }) =>
      enqueue({
        header: file.filename,
        message: emoji,
      })
    );

  useEffect(() => {
    if (!mimetype || !streamingurl) {
      const body = "mimetype or streamingurl is missing";
      enqueueError({ message: body });
      return;
    }

    const getContent = () => {
      const InnerComponent = COMPONENT_BY_MIMETYPE.get(mimetype!);
      if (!InnerComponent) {
        return <span>{`Unsupported: ${mimetype}`}</span>;
      }

      const updateWithFileid = (partialProps: Partial<CorganizeFile>) =>
        updateFile({
          fileid,
          ...partialProps,
        });

      return <InnerComponent file={file} updateFile={updateWithFileid} />;
    };

    setContent(getContent());
    markAsOpened(fileid);
    addUserAction({
      name: "Toggle Fav",
      icon: <StarIcon />,
      onClick: () => {
        toggleFavouriteWithToast();
      },
    });
  }, []);

  useEffect(() => {
    if (content) {
      madFocus(contentRef?.current, true);
    }
  }, [content]);

  const onKeyDown = (e: any) => {
    const key = e.key.toLowerCase();
    if (key === "w") {
      toggleFavouriteWithToast();
    } else if (key === "f") {
      if (handle.active) {
        handle.exit();
      } else {
        handle.enter();
      }
    }
  };

  const renderInnerContent = () => (
    <div className="file-view-content" onKeyDown={onKeyDown} ref={contentRef}>
      {handle.active && <ToastPortal />}
      {content}
    </div>
  );

  return (
    // @ts-ignore
    <FullScreen className="fullscreen-portal" handle={handle}>
      {renderInnerContent()}
    </FullScreen>
  );
};

export default FileView;
