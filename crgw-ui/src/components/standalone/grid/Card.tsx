import cls from "classnames";
import { InfoIcon } from "@chakra-ui/icons";
import {
  Box,
  Divider,
  HStack,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useBlanket } from "hooks/useBlanket";
import { CorganizeFile } from "typedefs/CorganizeFile";
import FileMetadataView from "../FileMetadataView";
import FileView from "../FileView";

import "./Card.scss";
import FileMetadataTags from "components/reusable/FileMetadataTag";

const Card = ({ file, index }: { file: CorganizeFile; index: number }) => {
  const { setBlanket } = useBlanket();
  const { streamingurl, mimetype, filename, fileid } = file;

  const openFile = () => {
    if (streamingurl) {
      setBlanket(filename, <FileView fileid={fileid} />);
    } else {
      // for testing purposes
      setBlanket(filename, <FileMetadataView file={file} />);
    }
  };

  const openJsonEditor = () =>
    setBlanket(filename, <FileMetadataView file={file} />);

  return (
    <Box
      className={cls("card", mimetype)}
      maxWidth="420px"
      w="full"
      bg={useColorModeValue("white", "gray.900")}
      boxShadow="xl"
      rounded="lg"
    >
      <VStack textAlign="center" p={6}>
        <label className="clickable" onClick={openFile}>
          <label className="index">{index}</label>
          {filename}
        </label>
        <Divider />
        <FileMetadataTags f={file} />
        <HStack>
          <InfoIcon className="clickable" onClick={openJsonEditor} />
        </HStack>
      </VStack>
    </Box>
  );
};

export default Card;
