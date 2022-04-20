import { useCallback, useEffect, useRef, useState } from "react";

import { useFileRepository } from "providers/fileRepository";
import { getInnermostChild } from "utils/elementUtils";
import { CorganizeFile } from "typedefs/CorganizeFile";
import WithFileContextMenu from "components/reusable/WithFileContextMenu";
import VideoView from "components/standalone/VideoView";
import GalleryView from "components/standalone/GalleryView";

import "./FileView.scss";
import { useToast } from "hooks/useToast";

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
  const contentRef = useRef<JSX.Element>();

  const file = findById(fileid);
  const { filename, multimedia } = file;

  const getContent = useCallback(() => {
    const { mimetype, streamingurl } = file;

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
          enqueue(filename, "File updated");
        })
        .catch((error: Error) => {
          if (error.message !== "foobar") {
            enqueue(filename, error.message);
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
  }, [enqueue, file, fileid, filename, multimedia, updateFile]);

  useEffect(() => {
    setContent(getContent());
  }, [getContent]);

  useEffect(() => {
    if (contentRef?.current) {
      const child = getInnermostChild(contentRef?.current);
      if (child) child.focus();
    }
  }, [content]);

  return (
    <WithFileContextMenu fileid={fileid}>
      {
        // @ts-ignore
        <div ref={contentRef}>{content}</div>
      }
    </WithFileContextMenu>
  );
};

export default FileView;
