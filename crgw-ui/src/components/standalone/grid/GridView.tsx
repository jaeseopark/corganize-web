import { SimpleGrid } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useGrid } from "providers/grid/hook";

import { madFocus } from "utils/elementUtils";

import FileMetadataView from "components/standalone/fileview/FileMetadataView";
import FileView from "components/standalone/fileview/FileView";
import Card from "components/standalone/grid/Card";
import PageControl from "components/standalone/grid/PageControl";
import FieldBar from "components/standalone/grid/field/FieldBar";
import GlobalSearch from "components/standalone/grid/field/GlobalSearch";
import ScrapePanel from "components/standalone/scrape/ScrapePanel";

const MIN_WIDTH = 200;

const InnerGrid = () => {
  const {
    fileProps: { files },
  } = useGrid();
  const { mostRecentFile } = useFileRepository();
  const { setBlanket } = useBlanket();
  const gridRef: any = useRef<HTMLDivElement | null>(null);

  const refocus = () => madFocus(gridRef.current);

  const [firstLocalFile] = files.filter((f) => f.streamingurl);

  const openFile = (f: CorganizeFile) => {
    if (!f) return;

    const { fileid } = f;
    setBlanket({
      fileid,
      body: <FileView fileid={fileid} />,
      onClose: refocus,
    });
  };

  const onKeyDown = (e: any) => {
    const key = e.key.toLowerCase();
    if (key === "e") {
      openFile(firstLocalFile);
    } else if (key === "o") {
      openFile(mostRecentFile);
    } else if (key === "s") {
      if (!mostRecentFile) return;
      setBlanket({
        title: "Scrape",
        body: <ScrapePanel defaultUrls={[mostRecentFile.sourceurl]} />,
        onClose: refocus,
      });
    } else if (key === "i") {
      if (!mostRecentFile) return;
      setBlanket({
        title: mostRecentFile.filename,
        body: <FileMetadataView file={mostRecentFile} />,
        onClose: refocus,
      });
    } else if (key === "w") {
      if (!mostRecentFile) return;
      // TODO
    } else if ("0" <= key && key <= "9") {
      const fileAtIndex = files.at(parseInt(key));
      if (fileAtIndex) {
        openFile(fileAtIndex);
      }
    }
  };

  const renderCards = () => {
    if (files.length === 0) {
      return <label>No files available</label>;
    }

    return files.map((f, i) => <Card key={f.fileid} file={f} index={i} focusGrid={refocus} />);
  };

  return (
    <SimpleGrid
      tabIndex={1}
      className="inner-grid"
      onKeyDown={onKeyDown}
      ref={gridRef}
      minChildWidth={`${MIN_WIDTH}px`}
      spacing={6}
      outline="none"
      marginY="1em"
    >
      {renderCards()}
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
      <FieldBar />
      <GlobalSearch />
      <PageControl />
      <InnerGrid />
      <PageControl />
    </div>
  );
};

export default GridView;
