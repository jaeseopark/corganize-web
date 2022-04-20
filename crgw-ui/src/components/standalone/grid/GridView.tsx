import { useEffect } from "react";
import { Box, SimpleGrid } from "@chakra-ui/react";
import { useGrid } from "hooks/useGrid";
import { useFileRepository } from "providers/fileRepository";
import FilterBar from "./FilterBar";

// TODO
const GlobalSearch = () => <div />;

const MIN_WIDTH = 200;

const InnerGrid = () => {
  const { files } = useGrid();

  return (
    <SimpleGrid className="inner-grid" minChildWidth={`${MIN_WIDTH}px`}>
      {files.map((f) => (
        <Box key={f.fileid}>
          <pre>{JSON.stringify(f, null, 2)}</pre>
        </Box>
      ))}
    </SimpleGrid>
  );
};

const GridView = () => {
  const { files } = useFileRepository();
  const { setFiles } = useGrid();

  useEffect(() => {
    setFiles(files);
  }, [files, setFiles]);

  return (
    <div className="grid-view">
      <FilterBar />
      <GlobalSearch />
      <InnerGrid />
    </div>
  );
};

export default GridView;
