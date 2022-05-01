import { SimpleGrid } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useGrid } from "providers/grid/hook";
import { useToast } from "providers/toast/hook";

import { madFocus } from "utils/elementUtils";

import Card from "components/standalone/grid/Card";

const GridView = () => {
  const {
    fileProps: { files },
  } = useGrid();
  const { mostRecentFile, toggleActivation } = useFileRepository();
  const { isBlanketEnabled } = useBlanket();
  const { enqueueSuccess } = useToast();
  const navigate = useNavigate();
  const gridRef: any = useRef<HTMLDivElement | null>(null);

  const refocus = () => madFocus(gridRef.current);

  useEffect(() => {
    if (!isBlanketEnabled) {
      refocus();
    }
  }, [isBlanketEnabled]);

  const [firstLocalFile] = files.filter((f) => f.streamingurl);

  const openFile = (file?: CorganizeFile) => {
    if (!file) return;
    navigate(`/file/${file.fileid}/content`);
  };

  const openJsonEditor = (file?: CorganizeFile) => {
    if (!file) return;
    navigate(`/file/${file.fileid}/info`);
  };

  const openScrapePanel = (file?: CorganizeFile) => {
    if (!file) return;
    navigate(`/scrape?urls=${file.sourceurl}`);
  };

  const onKeyDown = (e: any) => {
    if (e.shiftKey || e.ctrlKey) return;

    const key = e.key.toLowerCase();
    if (key === "e") {
      openFile(firstLocalFile);
    } else if (key === "o") {
      openFile(mostRecentFile);
    } else if (key === "s") {
      openScrapePanel(mostRecentFile);
    } else if (key === "i") {
      openJsonEditor(mostRecentFile);
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
        />
      ))}
    </SimpleGrid>
  );
};

export default GridView;
