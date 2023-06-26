import { SimpleGrid } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useGrid } from "providers/grid/hook";
import { useToast } from "providers/toast/hook";

import { useNavv } from "hooks/navv";

import { madFocus } from "utils/elementUtils";

import Card from "components/standalone/grid/Card";

const GridView = () => {
  const {
    fileProps: { files },
  } = useGrid();
  const { mostRecentFile, toggleActivation, toggleSessionBookmark } = useFileRepository();
  const { isBlanketEnabled } = useBlanket();
  const { enqueueSuccess } = useToast();
  const gridRef: any = useRef<HTMLDivElement | null>(null);
  const { navContent, navScrape, navJson, navTags } = useNavv();

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

  const onKeyDown = (e: any) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) return;

    const key = e.key.toLowerCase();
    if (key === "e") {
      openFile(firstLocalFile);
    } else if (key === "o") {
      openFile(mostRecentFile);
    } else if (key === "s") {
      openScrapePanel(mostRecentFile);
    } else if (key === "u") {
      window.open(mostRecentFile.sourceurl, "_blank");
    } else if (key === "j") {
      openJsonEditor(mostRecentFile);
    } else if (key === "l") {
      openTagEditor(mostRecentFile);
    } else if (key === "w") {
      if (!mostRecentFile) return;
      toggleActivation(mostRecentFile.fileid).then(({ message, emoji }) =>
        enqueueSuccess({ message: `${message} ${emoji}` })
      );
    } else if ("0" <= key && key <= "9") {
      const fileAtIndex = files.at(parseInt(key));
      if (fileAtIndex) {
        openFile(fileAtIndex);
      }
    } else if (key === "`") {
      toggleSessionBookmark(mostRecentFile).then((bookmarked) => {
        const message = `Bookmark ${bookmarked ? "set" : "removed"}`;
        enqueueSuccess({ message });
      });
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
