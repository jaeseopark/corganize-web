import { Divider, SimpleGrid } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { StringParam, useQueryParam } from "use-query-params";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useGrid } from "providers/grid/hook";
import { useToast } from "providers/toast/hook";

import { madFocus } from "utils/elementUtils";

import FileMetadataView from "components/standalone/fileview/FileMetadataView";
import FileView from "components/standalone/fileview/FileView";
import Card from "components/standalone/grid/Card";
import GlobalSearch from "components/standalone/grid/GlobalSearch";
import PageControl from "components/standalone/grid/PageControl";
import PresetBar from "components/standalone/grid/PresetBar";
import FieldBar from "components/standalone/grid/field/FieldBar";
import ScrapePanel from "components/standalone/scrape/ScrapePanel";

const InnerGrid = () => {
  const {
    fileProps: { files },
  } = useGrid();
  const { mostRecentFile, toggleActivation, findById } = useFileRepository();
  const { setBlanket } = useBlanket();
  const { enqueueSuccess, enqueueWarning } = useToast();
  const gridRef: any = useRef<HTMLDivElement | null>(null);
  const [targetedFileid] = useQueryParam("id", StringParam);

  const refocus = () => madFocus(gridRef.current);

  const [firstLocalFile] = files.filter((f) => f.streamingurl);

  const openFile = (file?: CorganizeFile) => {
    if (!file) return;

    const { fileid } = file;
    setBlanket({
      fileid,
      body: <FileView fileid={fileid} />,
      onClose: refocus,
    });
  };

  const openJsonEditor = (file?: CorganizeFile) => {
    if (!file) return;
    setBlanket({
      fileid: file.fileid,
      body: <FileMetadataView file={file} />,
      onClose: refocus,
    });
  };

  const openScrapePanel = (file?: CorganizeFile) => {
    if (!file) return;
    setBlanket({
      title: "Scrape",
      body: <ScrapePanel defaultUrls={[file.sourceurl]} />,
      onClose: refocus,
    });
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

  useEffect(() => {
    if (targetedFileid) {
      const file = findById(targetedFileid);
      if (file) {
        openFile(file);
      } else {
        enqueueWarning({ header: "Not found", message: `File w/ ID ${targetedFileid}` });
      }
    }
  }, [targetedFileid]);

  return (
    <SimpleGrid
      tabIndex={1}
      className="inner-grid"
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

const GridView = () => {
  const { files } = useFileRepository();
  const {
    fileProps: { setFiles },
  } = useGrid();

  useEffect(() => {
    if (files && files.length > 0) {
      setFiles(files);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  return (
    <div className="grid-view">
      <PresetBar />
      <Divider marginY=".5em" />
      <FieldBar />
      <GlobalSearch />
      <PageControl />
      <InnerGrid />
      <PageControl />
    </div>
  );
};

export default GridView;
