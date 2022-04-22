import { useEffect, useRef, useState } from "react";

import { useFileRepository } from "hooks/useFileRepository";
import VideoView from "components/standalone/fileview/VideoView";
import GalleryView from "components/standalone/fileview/GalleryView";

import { useToast } from "hooks/useToast";

import "./FileView.scss";
import { getInnermostChild } from "utils/elementUtils";

const COMPONENT_BY_MIMETYPE: Map<string, any> = new Map(); // TODO how to type JSX.Element?
COMPONENT_BY_MIMETYPE.set("video/mp4", VideoView);
COMPONENT_BY_MIMETYPE.set("video/x-matroska", VideoView);
COMPONENT_BY_MIMETYPE.set("video/x-m4v", VideoView);
COMPONENT_BY_MIMETYPE.set("video/quicktime", VideoView);
COMPONENT_BY_MIMETYPE.set("application/zip", GalleryView);

const FileView = ({ fileid }: { fileid: string }) => {
  const { findById, markAsOpened, updateFile, toggleFavourite } = useFileRepository();
  const [content, setContent] = useState<JSX.Element>();
  const { enqueue } = useToast();
  const contentRef = useRef();

  const file = findById(fileid);
  const { mimetype, streamingurl } = file;

  useEffect(() => {
    if (!mimetype || !streamingurl) {
      const body = "mimetype or streamingurl is missing";
      enqueue({ type: "error", body });
      return;
    }

    const getContent = () => {
      const InnerComponent = COMPONENT_BY_MIMETYPE.get(mimetype!);
      if (!InnerComponent) {
        return <span>{`Unsupported: ${mimetype}`}</span>;
      }

      return <InnerComponent file={file} updateFile={updateFile} />;
    };

    setContent(getContent());
    markAsOpened(fileid);
  }, []);

  useEffect(() => {
    const focusElement = () => {
      if (contentRef?.current) {
        const child = getInnermostChild(contentRef.current);
        if (child) {
          child.focus();
          return;
        }
      }
      setTimeout(focusElement, 250);
    };

    if (content) {
      focusElement();
    }
  }, [content]);

  const onKeyDown = (e: any) => {
    const key = e.key.toLowerCase();
    if (key === "w") {
      toggleFavourite(fileid).then(({ emoji }) =>
        enqueue({
          title: file.filename,
          body: emoji,
        })
      );
    }
  };

  return (
    // @ts-ignore
    <div className="file-view" onKeyDown={onKeyDown} ref={contentRef}>
      {content}
    </div>
  );
};

export default FileView;
