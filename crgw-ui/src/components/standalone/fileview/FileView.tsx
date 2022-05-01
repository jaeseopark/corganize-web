import { StarIcon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { StringParam, useQueryParam } from "use-query-params";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";
import ToastPortal from "providers/toast/portal";

import { madFocus } from "utils/elementUtils";

import RendererSelection, { getRenderer } from "components/standalone/fileview/RendererSelection";

import "./FileView.scss";

const FileView = ({ fileid }: { fileid: string }) => {
  const { upsertUserAction } = useBlanket();
  const { findById, markAsOpened, toggleActivation } = useFileRepository();
  const [, setTargetedId] = useQueryParam("id", StringParam);
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
    setTargetedId(fileid);

    if (!streamingurl) {
      const body = "streamingurl is missing";
      enqueueError({ message: body });
      return;
    }

    const getContent = () => {
      const Renderer = getRenderer(mimetype);
      if (!Renderer) {
        return <RendererSelection setContent={setContent} fileid={fileid} />;
      }

      return <Renderer fileid={fileid} />;
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
    if (e.shiftKey || e.ctrlKey) {
      return;
    }

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

  return (
    // @ts-ignore
    <FullScreen className="fullscreen-portal" handle={handle}>
      <div className="file-view-content" onKeyDown={onKeyDown} ref={contentRef}>
        {handle.active && <ToastPortal />}
        {content}
      </div>
    </FullScreen>
  );
};

export default FileView;
