import { SimpleGrid } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useGrid } from "providers/grid/hook";
import { useToast } from "providers/toast/hook";

import { useNavv } from "hooks/navv";

import { madFocus } from "utils/elementUtils";
import { getKeyDownLookupKey } from "utils/keyUtils";

import Card from "components/standalone/grid/Card";

const GridView = () => {
  const {
    fileProps: { files },
  } = useGrid();
  const { mostRecentFile, toggleActivation, toggleSessionBookmark } = useFileRepository();
  const { isBlanketEnabled } = useBlanket();
  const { enqueueSuccess } = useToast();
  const gridRef: any = useRef<HTMLDivElement | null>(null);
  const { navContent, navScrape, navJson, navTags, navBlankScrape } = useNavv();

  const refocus = () => madFocus(gridRef.current);

  useEffect(() => {
    if (!isBlanketEnabled) {
      refocus();
    }
  }, [isBlanketEnabled]);

  const [firstLocalFile] = files.filter((f) => f.streamingurl);

  const openFile = (file?: CorganizeFile) => {
    if (!file) return;
    navContent(file);
  };

  const openJsonEditor = (file?: CorganizeFile) => {
    if (!file) return;
    navJson(file);
  };

  const openTagEditor = (file?: CorganizeFile) => {
    if (!file) return;
    navTags(file);
  };

  const openScrapePanel = (file?: CorganizeFile) => {
    if (!file) return;
    navScrape(file);
  };

  const toggleActivationOfFile = (file?: CorganizeFile) => {
    if (!file) return;
    toggleActivation(file.fileid).then(({ message, emoji }) =>
      enqueueSuccess({ message: `${message} ${emoji}` })
    );
  };

  const toggleSessionBookmarkOnFile = (file?: CorganizeFile) => {
    if (!file) return;
    toggleSessionBookmark(file.fileid).then((bookmarked) => {
      const message = `Bookmark ${bookmarked ? "set" : "removed"}`;
      enqueueSuccess({ message });
    });
  };

  const keyMapping: { [key: string]: () => void } = {
    "^..s": navBlankScrape,
    "...e": () => openFile(firstLocalFile),
    "...o": () => openFile(mostRecentFile),
    "...s": () => openScrapePanel(mostRecentFile),
    "...u": () => window.open(mostRecentFile.sourceurl, "_blank"),
    "...j": () => openJsonEditor(mostRecentFile),
    "...l": () => openTagEditor(mostRecentFile),
    "...w": () => toggleActivationOfFile(mostRecentFile),
    "...`": () => toggleSessionBookmarkOnFile(mostRecentFile),
  };

  const onKeyDown = (e: any) => {
    const func = keyMapping[getKeyDownLookupKey(e)];
    if (func) {
      return func();
    }

    const key = e.key.toLowerCase();
    if ("0" <= key && key <= "9") {
      const fileAtIndex = files.at(parseInt(key));
      if (fileAtIndex) {
        openFile(fileAtIndex);
      }
    }
  };

  return (
    <SimpleGrid
      tabIndex={1}
      className="grid-view"
      onKeyDown={onKeyDown}
      ref={gridRef}
      columns={[1, 2, 3, 4, 5]}
      spacing={6}
      outline="none"
      marginY="1em"
    >
      {files.map((f, i) => (
        <Card
          key={f.fileid}
          fileid={f.fileid}
          index={i}
          openFile={openFile}
          openScrapePanel={openScrapePanel}
          openJsonEditor={openJsonEditor}
          openTagEditor={openTagEditor}
        />
      ))}
    </SimpleGrid>
  );
};

export default GridView;
