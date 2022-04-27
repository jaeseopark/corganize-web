import { StarIcon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";
import ToastPortal from "providers/toast/portal";

import { madFocus } from "utils/elementUtils";

import VideoView from "components/standalone/fileview/VideoView";
import GalleryView from "components/standalone/fileview/gallery/GalleryView";

import "./FileView.scss";

type ContentRenderer = ({ fileid }: { fileid: string }) => JSX.Element | null;

const COMPONENT_BY_MIMETYPE: Map<string, ContentRenderer> = new Map([
  ["video/mp4", VideoView],
  ["video/x-matroska", VideoView],
  ["video/x-m4v", VideoView],
  ["video/quicktime", VideoView],
  ["application/zip", GalleryView],
]);

const FileView = ({ fileid }: { fileid: string }) => {
  const { upsertUserAction } = useBlanket();
  const { findById, markAsOpened, toggleActivation } = useFileRepository();
  const [content, setContent] = useState<JSX.Element>();
  const handle = useFullScreenHandle();
  const { enqueueSuccess, enqueueError } = useToast();
  const contentRef = useRef<HTMLDivElement | null>(null);

  const file = findById(fileid);
  const { mimetype, streamingurl } = file;

  const toggleActivationWithToast = () =>
    toggleActivation(fileid)
      .then(({ message, emoji }) =>
        enqueueSuccess({
          message: `${message} ${emoji}`,
        })
      )
      .catch((error: Error) => enqueueError({ message: error.message }));

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

      return <InnerComponent fileid={fileid} />;
    };

    setContent(getContent());
    markAsOpened(fileid)
      .then(() => enqueueSuccess({ message: "File marked as open" }))
      .catch((error: Error) => enqueueError({ message: error.message }));
  }, []);

  useEffect(() => {
    if (content) {
      madFocus(contentRef?.current, true);
    }
  }, [content]);

  useEffect(() => {
    upsertUserAction({
      name: "Actv",
      icon: <StarIcon />,
      onClick: toggleActivationWithToast,
    });
  });

  const onKeyDown = (e: any) => {
    const key = e.key.toLowerCase();
    if (key === "w") {
      toggleActivationWithToast();
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
