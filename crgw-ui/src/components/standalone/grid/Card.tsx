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
  const openable = !!streamingurl;

  const openFile = () => {
    if (openable)
      setBlanket({ title: filename, body: <FileView fileid={fileid} /> });
  };

  const openJsonEditor = () =>
    setBlanket({ title: filename, body: <FileMetadataView file={file} /> });

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
