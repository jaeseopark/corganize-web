import { InfoIcon } from "@chakra-ui/icons";
import {
  Box,
  Divider,
  HStack,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useBlanket } from "hooks/useBlanket";
import styled from "styled-components";
import { CorganizeFile } from "typedefs/CorganizeFile";
import FileMetadataView from "../FileMetadataView";
import FileView from "../FileView";

const Card = ({ file, index }: { file: CorganizeFile; index: number }) => {
  const { setBlanket } = useBlanket();
  const { streamingurl, mimetype, filename, fileid } = file;

  const openFile = () => {
    if (streamingurl) {
      setBlanket(filename, <FileView fileid={fileid} />);
    }
  };

  const openJsonEditor = () =>
    setBlanket(filename, <FileMetadataView file={file} />);

  return (
    <VStack
      maxW={"420px"}
      w={"full"}
      bg={useColorModeValue("white", "gray.900")}
      boxShadow={"xl"}
      rounded={"lg"}
      p={6}
      textAlign={"center"}
    >
      <Index>{index}</Index>
      <label onClick={openFile}>{filename}</label>
      <Divider />
      <div className="tags">{mimetype}</div>
      <HStack>
        <InfoIcon onClick={openJsonEditor} />
      </HStack>
    </VStack>
  );
};

export default Card;

const Index = styled.label`
  background-color: pink;
`;
