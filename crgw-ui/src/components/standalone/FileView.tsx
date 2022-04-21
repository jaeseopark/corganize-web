import { useCallback, useEffect, useRef, useState } from "react";

import { useToast } from "hooks/useToast";
import { useFileRepository } from "hooks/useFileRepository";
import { getInnermostChild } from "utils/elementUtils";
import { CorganizeFile } from "typedefs/CorganizeFile";
import WithFileContextMenu from "components/reusable/WithFileContextMenu";
import VideoView from "components/standalone/VideoView";
import GalleryView from "components/standalone/GalleryView";

import "./FileView.scss";

const COMPONENT_BY_MIMETYPE: Map<string, any> = new Map(); // TODO how to type JSX.Element?
COMPONENT_BY_MIMETYPE.set("video/mp4", VideoView);
COMPONENT_BY_MIMETYPE.set("video/x-matroska", VideoView);
COMPONENT_BY_MIMETYPE.set("video/x-m4v", VideoView);
COMPONENT_BY_MIMETYPE.set("video/quicktime", VideoView);
COMPONENT_BY_MIMETYPE.set("application/zip", GalleryView);

const FileView = ({ fileid }: { fileid: string }) => {
  const { enqueue } = useToast();
  const { findById, updateFile } = useFileRepository();
  const [content, setContent] = useState<JSX.Element>();
  const contentRef: any = useRef();

  const file = findById(fileid);

  const getContent = useCallback(() => {
    const { filename, multimedia, mimetype, streamingurl } = file;

    if (!mimetype) {
      return <span tabIndex={1}>Mimetype is missing</span>;
    }

    const InnerComponent = COMPONENT_BY_MIMETYPE.get(mimetype);
    if (!InnerComponent) {
      return <span tabIndex={1}>{`Unsupported: ${mimetype}`}</span>;
    }

    const updateFileWrapper = (partialProps: CorganizeFile) => {
      updateFile({ ...partialProps, fileid, filename })
        .then((file) => {
          enqueue({ title: filename, body: "File updated" });
        })
        .catch((error: Error) => {
          if (error.message !== "foobar") {
            enqueue({ title: filename, body: error.message });
          }
        });
    };

    return (
      <InnerComponent
        path={streamingurl}
        updateFile={updateFileWrapper}
        multimedia={multimedia}
      />
    );
  }, [enqueue, file, fileid, updateFile]);

  useEffect(() => {
    if (file) {
      setContent(getContent());
    }
  }, [getContent, file]);

  useEffect(() => {
    if (contentRef?.current) {
      const child = getInnermostChild(contentRef?.current);
      if (child) child.focus();
    }
  }, [content]);

  if (!file) {
    return <label>file not found. fileid: {fileid}</label>
  }

  return (
    <WithFileContextMenu fileid={fileid}>
      <div ref={contentRef}>{content}</div>
    </WithFileContextMenu>
  );
};

export default FileView;
