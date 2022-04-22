import { useEffect, useRef, useState } from "react";

import { useFileRepository } from "hooks/useFileRepository";
import VideoView from "components/standalone/fileview/VideoView";
import GalleryView from "components/standalone/fileview/GalleryView";

import { useToast } from "hooks/useToast";

import "./FileView.scss";


const COMPONENT_BY_MIMETYPE: Map<string, any> = new Map(); // TODO how to type JSX.Element?
COMPONENT_BY_MIMETYPE.set("video/mp4", VideoView);
COMPONENT_BY_MIMETYPE.set("video/x-matroska", VideoView);
COMPONENT_BY_MIMETYPE.set("video/x-m4v", VideoView);
COMPONENT_BY_MIMETYPE.set("video/quicktime", VideoView);
COMPONENT_BY_MIMETYPE.set("application/zip", GalleryView);

const FileView = ({ fileid }: { fileid: string }) => {
  const { findById, markAsOpened, updateFile, toggleFavourite } = useFileRepository();
  const [readyToRender, setReadyToRender] = useState(false);
  const { enqueue } = useToast();

  const file = findById(fileid);
  const { mimetype, streamingurl } = file;

  useEffect(() => {
    if (!mimetype || !streamingurl) {
      const body = "mimetype or streamingurl is missing";
      enqueue({ type: "error", body });
      return;
    }

    markAsOpened(fileid);
    setReadyToRender(true);
  }, []);

  const onKeyDown = (e: any) => {
    const key = e.key.toLowerCase();
    if (key === "w") {
      toggleFavourite(fileid)
        .then(({ emoji }) => enqueue({
          title: file.filename,
          body: emoji
        }))
    }
  }

  const renderInnerComponent = () => {
    if (!readyToRender) {
      return null;
    }

    const InnerComponent = COMPONENT_BY_MIMETYPE.get(mimetype!);
    if (!InnerComponent) {
      return <span>{`Unsupported: ${mimetype}`}</span>;
    }

    return <InnerComponent file={file} updateFile={updateFile} />;
  }

  return <div className="file-view" onKeyDown={onKeyDown}>{renderInnerComponent()}</div>
};

export default FileView;
