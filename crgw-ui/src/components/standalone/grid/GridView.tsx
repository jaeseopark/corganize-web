import { useEffect } from "react";
import { SimpleGrid } from "@chakra-ui/react";
import { useGrid } from "hooks/useGrid";
import { useFileRepository } from "providers/fileRepository";
import FilterBar from "./filter/FilterBar";
import GlobalSearch from "./filter/GlobalSearch";
import Card from "./Card";

const MIN_WIDTH = 200;

const InnerGrid = () => {
  const { files } = useGrid();

  return (
    <SimpleGrid
      className="inner-grid"
      minChildWidth={`${MIN_WIDTH}px`}
      spacing={6}
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
