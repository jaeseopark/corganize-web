import { useEffect, useRef } from "react";
import { SimpleGrid } from "@chakra-ui/react";
import { useGrid } from "hooks/useGrid";
import { useFileRepository } from "hooks/useFileRepository";
import FilterBar from "./filter/FilterBar";
import GlobalSearch from "./filter/GlobalSearch";
import Card from "./Card";
import { useBlanket } from "hooks/useBlanket";
import { useToast } from "hooks/useToast";
import FileMetadataView from "../FileMetadataView";
import PageControl from "./PageControl";

const MIN_WIDTH = 200;

const InnerGrid = () => {
  const {
    fileProps: { files },
  } = useGrid();
  const { setBlanket } = useBlanket();
  const { enqueue } = useToast();
  const gridRef: any = useRef();

  const [firstLocalFile] = files.filter((f) => true); // TODO test

  const refocus = () => {
    setTimeout(() => {
      gridRef.current.focus();
    }, 100);
  };

  const onKeyDown = (e: any) => {
    const key = e.key.toLowerCase();
    if (key === "e") {
      setBlanket({
        title: firstLocalFile.filename,
        body: <FileMetadataView file={firstLocalFile} />,
        onClose: refocus,
      });
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
      <FilterBar />
      <GlobalSearch />
      <PageControl />
      <InnerGrid />
      <PageControl />
    </div>
  );
};

export default GridView;
