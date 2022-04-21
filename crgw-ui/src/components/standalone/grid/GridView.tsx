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

const MIN_WIDTH = 200;

const InnerGrid = () => {
  const { files } = useGrid();
  const { openFile, setBlanket, isBlanketEnabled } = useBlanket();
  const [firstLocalFile] = files.filter((f) => true); // TODO test
  const { enqueue } = useToast();
  const gridRef: any = useRef();

  useEffect(() => {
    if (!isBlanketEnabled) {
      // upon exiting blanket, need to re-focus the grid so the key down events register properly
      gridRef.current.focus();
    }
  });

  const onKeyDown = (e: any) => {
    const key = e.key.toLowerCase();
    if (key === "e") {
      setBlanket(
        firstLocalFile.filename,
        <FileMetadataView file={firstLocalFile} />
      );
      // openFile(firstLocalFile);
    }
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
      {files.map((f, i) => (
        <Card key={f.fileid} file={f} index={i} />
      ))}
    </SimpleGrid>
  );
};

const GridView = () => {
  const { files } = useFileRepository();
  const { setFiles } = useGrid();

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
      <InnerGrid />
    </div>
  );
};

export default GridView;
