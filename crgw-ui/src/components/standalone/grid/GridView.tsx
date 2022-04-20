import { useEffect } from "react";
import { Box, SimpleGrid, useColorModeValue } from "@chakra-ui/react";
import { useGrid } from "hooks/useGrid";
import { useFileRepository } from "providers/fileRepository";
import FilterBar from "./filter/FilterBar";
import GlobalSearch from "./filter/GlobalSearch";

const MIN_WIDTH = 200;

const Card = ({ children }: { children: JSX.Element }) => (
  <Box
    maxW={"420px"}
    w={"full"}
    bg={useColorModeValue("white", "gray.900")}
    boxShadow={"xl"}
    rounded={"lg"}
    p={6}
    textAlign={"center"}
  >
    {children}
  </Box>
);

const InnerGrid = () => {
  const { files } = useGrid();

  return (
    <SimpleGrid
      className="inner-grid"
      minChildWidth={`${MIN_WIDTH}px`}
      spacing={6}
    >
      {files.map((f) => (
        <Card key={f.fileid}>
          <label>{f.filename}</label>
        </Card>
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
