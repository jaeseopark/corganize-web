import cls from "classnames";
import { InfoIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Divider, HStack, useColorModeValue, VStack } from "@chakra-ui/react";
import { useBlanket } from "providers/blanket/hook";
import { CorganizeFile } from "typedefs/CorganizeFile";
import FileMetadataView from "components/standalone/fileview/FileMetadataView";
import FileView from "components/standalone/fileview/FileView";

import "./Card.scss";
import FileMetadataTags from "components/reusable/FileMetadataTag";
import ScrapePanel from "../scrape/ScrapePanel";

const IndexLabel = ({ index }: { index: number }) => {
  if (index >= 10) {
    // no hotkeys
    return null;
  }
  return <label className="index">{index}</label>;
};

const Card = ({
  file,
  index,
  focusGrid,
}: {
  file: CorganizeFile;
  index: number;
  focusGrid: () => void;
}) => {
  const { setBlanket } = useBlanket();
  const { streamingurl, mimetype, filename, fileid } = file;
  const openable = !!streamingurl;

  const openFile = () => {
    if (openable)
      setBlanket({ title: filename, body: <FileView fileid={fileid} />, onClose: focusGrid });
  };

  const openJsonEditor = () =>
    setBlanket({ title: filename, body: <FileMetadataView file={file} />, onClose: focusGrid });

  const openScrapePanel = () =>
    setBlanket({
      title: "Scrape",
      body: <ScrapePanel defaultUrls={[file.sourceurl]} />,
      onClose: focusGrid,
    });

  return (
    <Box
      className={cls("card", mimetype)}
      bg={useColorModeValue("white", "gray.900")}
      maxW="400px"
      boxShadow="xl"
      rounded="lg"
    >
      <VStack textAlign="center" p={6}>
        <label className={cls({ clickable: openable })} onClick={openFile}>
          <IndexLabel index={index} />
          {filename}
        </label>
        <Divider />
        <FileMetadataTags f={file} />
        <HStack>
          <InfoIcon className="clickable" onClick={openJsonEditor} />
          <SearchIcon className="clickable" onClick={openScrapePanel} />
        </HStack>
      </VStack>
    </Box>
  );
};

export default Card;
