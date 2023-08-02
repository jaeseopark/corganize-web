import { SearchIcon, StarIcon } from "@chakra-ui/icons";
import { Button, Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import styled from "styled-components";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";
import ToastPortal from "providers/toast/portal";

import { useNavv } from "hooks/navv";

import { madFocus } from "utils/elementUtils";
import { getKeyDownLookupKey } from "utils/keyUtils";

import FileTagEditor from "components/reusable/FileTagEditor";
import GalleryView from "components/standalone/fileview/gallery/GalleryView";
import VideoView from "components/standalone/fileview/video/VideoView";

import "./FileView.scss";

const InvisibleButton = styled(Button)`
  height: 0;
  overflow: hidden;
`;

const getRendererByMimetype = (mimetype?: string) => {
  switch (mimetype) {
    case "application/zip":
      return GalleryView;
    case "video/mp4":
    case "video/x-matroska":
    case "video/x-m4v":
    case "video/quicktime":
    default:
      return VideoView;
  }
};

const FileView = ({ fileid }: { fileid: string }) => {
  const { upsertUserAction } = useBlanket();
  const { findById, markAsOpened, toggleActivation, toggleSessionBookmark } = useFileRepository();
  const [content, setContent] = useState<JSX.Element>();
  const handle = useFullScreenHandle();
  const { enqueueSuccess, enqueueError } = useToast();
  const contentRef = useRef<any>(null);
  const { navScrape, navJson, navBlankScrape } = useNavv();
  const {
    isOpen: isTagPopoverOpen,
    onToggle: onTagPopoverToggle,
    onClose: onTagPopoverClose,
  } = useDisclosure();

  const file = findById(fileid);
  const { mimetype, streamingurl } = file;

  const toggleActivationWithToast = useCallback(
    () =>
      toggleActivation(fileid)
        .then(({ message, emoji }) =>
          enqueueSuccess({
            message: `${message} ${emoji}`,
          })
        )
        .catch((error: Error) => enqueueError({ message: error.message })),
    [toggleActivation]
  );

  const madFocusContent = useCallback(() => {
    if (content && contentRef?.current && !isTagPopoverOpen) {
      madFocus(contentRef.current);
    }
  }, [isTagPopoverOpen, content, contentRef]);

  useEffect(() => {
    if (!streamingurl) {
      const body = "streamingurl is missing";
      enqueueError({ message: body });
      return;
    }

    const Renderer = getRendererByMimetype(mimetype);
    setContent(<Renderer fileid={fileid} ref={contentRef} />);
    markAsOpened(fileid)
      .then(() => enqueueSuccess({ message: "File marked as open" }))
      .catch((error: Error) => enqueueError({ message: error.message }));
  }, []);

  useEffect(() => {
    madFocusContent();
  }, [madFocusContent]);

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

  const toggleFullScreen = () => {
    if (handle.active) {
      handle.exit();
    } else {
      handle.enter();
    }
  };

  const toggleSessionBookmarkOnThisFile = () =>
    toggleSessionBookmark(fileid).then((bookmarked) => {
      const message = `Bookmark ${bookmarked ? "set" : "removed"}`;
      enqueueSuccess({ message });
    });

  const keyMapping: { [key: string]: () => void } = {
    "^..s": navBlankScrape,
    "...f": toggleFullScreen,
    "...l": onTagPopoverToggle,
    "...w": toggleActivationWithToast,
    "...`": toggleSessionBookmarkOnThisFile,
    "...j": () => navJson(file),
    "...s": () => navScrape(file),
    "...u": () => window.open(file.sourceurl, "_blank"),
  };

  const onKeyDown = (e: any) => {
    const func = keyMapping[getKeyDownLookupKey(e)];
    if (func) {
      func();
    }
  };

  return (
    <>
      <Popover
        placement="bottom"
        closeOnBlur={true}
        isOpen={isTagPopoverOpen}
        onClose={onTagPopoverClose}
      >
        {
          // @ts-ignore
          <PopoverTrigger>
            <InvisibleButton onClick={onTagPopoverToggle}>Tag Editor</InvisibleButton>
          </PopoverTrigger>
        }
        <PopoverContent>
          {isTagPopoverOpen && <FileTagEditor fileid={fileid} mini={true} />}
        </PopoverContent>
      </Popover>
      {
        // @ts-ignore
        <FullScreen className="fullscreen-portal" handle={handle}>
          <div className="file-view-content" onKeyDown={onKeyDown}>
            {handle.active && <ToastPortal />}
            {content}
          </div>
        </FullScreen>
      }
    </>
  );
};

export default FileView;
