import { SearchIcon, StarIcon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";
import ToastPortal from "providers/toast/portal";

import { useNavv } from "hooks/navv";

import { madFocus } from "utils/elementUtils";

import GalleryView from "components/standalone/fileview/gallery/GalleryView";
import VideoView from "components/standalone/fileview/video/VideoView";

import "./FileView.scss";

type ContentRenderer = ({ fileid }: { fileid: string }) => JSX.Element | null;

const RENDERER_BY_MIMETYPE: Map<string, ContentRenderer> = new Map([
  ["video/mp4", VideoView],
  ["video/x-matroska", VideoView],
  ["video/x-m4v", VideoView],
  ["video/quicktime", VideoView],
  ["application/zip", GalleryView],
]);

export const getRenderer = (mimetype?: string) =>
  RENDERER_BY_MIMETYPE.get(mimetype || "") || VideoView;

const FileView = ({ fileid }: { fileid: string }) => {
  const { upsertUserAction } = useBlanket();
  const { findById, markAsOpened, toggleActivation } = useFileRepository();
  const [content, setContent] = useState<JSX.Element>();
  const handle = useFullScreenHandle();
  const { enqueueSuccess, enqueueError } = useToast();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { navScrape, navJson, navTags } = useNavv();

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
    if (!streamingurl) {
      const body = "streamingurl is missing";
      enqueueError({ message: body });
      return;
    }

    const getContent = () => {
      const Renderer = getRenderer(mimetype);
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
    upsertUserAction({
      name: "Scrape",
      icon: <SearchIcon />,
      onClick: () => navScrape(file),
    });
  }, []);

  const onKeyDown = (e: any) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      return;
    }

    const key = e.key.toLowerCase();
    if (key === "w") {
      toggleActivationWithToast();
    } else if (key === "s") {
      navScrape(file);
    } else if (key === "j") {
      navJson(file);
    } else if (key === "l") {
      navTags(file);
    } else if (key === "u") {
      window.open(file.sourceurl, "_blank");
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
