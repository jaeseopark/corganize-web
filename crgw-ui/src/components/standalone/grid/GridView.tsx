import { useEffect, useRef } from "react";
import { SimpleGrid } from "@chakra-ui/react";
import { useGrid } from "hooks/useGrid";
import { useFileRepository } from "hooks/useFileRepository";
import FieldBar from "./field/FieldBar";
import GlobalSearch from "./field/GlobalSearch";
import Card from "./Card";
import { useBlanket } from "hooks/useBlanket";
import PageControl from "./PageControl";
import FileView from "components/standalone/fileview/FileView";
import { CorganizeFile } from "typedefs/CorganizeFile";
import ScrapePanel from "../scrape/ScrapePanel";
import FileMetadataView from "components/standalone/fileview/FileMetadataView";

const MIN_WIDTH = 200;

const InnerGrid = () => {
  const {
    fileProps: { files },
  } = useGrid();
  const { mostRecentFile } = useFileRepository();
  const { setBlanket } = useBlanket();
  const gridRef: any = useRef();

  const [firstLocalFile] = files.filter((f) => true); // TODO test

  const refocus = () => {
    setTimeout(() => {
      gridRef.current.focus();
    }, 100);
  };

  const openFile = (f: CorganizeFile) => {
    if (!f) return;

    const { fileid, filename } = f;
    setBlanket({
      title: filename,
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
        title: mostRecentFile.filename,
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

    return files.map((f, i) => <Card key={f.fileid} file={f} index={i} />);
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
