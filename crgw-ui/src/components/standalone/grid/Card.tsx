import { InfoIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Divider, HStack, VStack, useColorModeValue } from "@chakra-ui/react";
import cls from "classnames";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";

import FileIcon from "components/reusable/FileIcon";
import FileTags from "components/reusable/FileTags";
import FileMetadataView from "components/standalone/fileview/FileMetadataView";
import FileView from "components/standalone/fileview/FileView";
import ScrapePanel from "components/standalone/scrape/ScrapePanel";

import "./Card.scss";

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
      setBlanket({
        title: filename,
        body: <FileView fileid={fileid} />,
        onClose: focusGrid,
      });
  };

  const openJsonEditor = () =>
    setBlanket({
      title: filename,
      body: <FileMetadataView file={file} />,
      onClose: focusGrid,
    });

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
      boxShadow="xl"
      rounded="lg"
    >
      <VStack textAlign="center" p={6}>
        <label className={cls("filename", { clickable: openable })} onClick={openFile}>
          <IndexLabel index={index} />
          {filename}
        </label>
        <Divider />
        <FileIcon f={file} />
        <Divider />
        <FileTags f={file} />
        <HStack>
          <InfoIcon className="clickable" onClick={openJsonEditor} />
          <SearchIcon className="clickable" onClick={openScrapePanel} />
        </HStack>
      </VStack>
    </Box>
  );
};

export default Card;
