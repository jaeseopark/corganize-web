import { Box, Divider, useColorModeValue, VStack } from "@chakra-ui/react";
import styled from "styled-components";
import { CorganizeFile } from "typedefs/CorganizeFile";

const Card = ({ file, index }: { file: CorganizeFile; index: number }) => (
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
    <label>{file.filename}</label>
    <Divider />
    {file.mimetype}
  </VStack>
);

export default Card;

const Index = styled.label`
  background-color: pink;
`;
