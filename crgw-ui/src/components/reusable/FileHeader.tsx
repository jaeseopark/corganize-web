import { Center, VStack } from "@chakra-ui/react";

import { useFileRepository } from "providers/fileRepository/hook";

import FileTags from "components/reusable/FileTags";

import "./FileHeader.scss";

const FileHeader = ({ fileid }: { fileid: string }) => {
  const { findById } = useFileRepository();
  const file = findById(fileid);
  const { filename } = file;

  return (
    <VStack className="file-header" spacing=".5em">
      <FileTags f={file} />
      <Center>{filename}</Center>
    </VStack>
  );
};

export default FileHeader;
