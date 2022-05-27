import { AttachmentIcon, EditIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Divider, HStack, VStack, useColorModeValue } from "@chakra-ui/react";
import cls from "classnames";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useFileRepository } from "providers/fileRepository/hook";

import FileBadges from "components/reusable/FileBadges";
import FileIcon from "components/reusable/FileIcon";

import "./Card.scss";

const IndexLabel = ({ index }: { index: number }) => {
  if (index >= 10) {
    // no hotkeys
    return null;
  }
  return <label className="index">{index}</label>;
};

type FileAction = (f?: CorganizeFile) => void;

const Card = ({
  fileid,
  index,
  openFile,
  openScrapePanel,
  openJsonEditor,
  openTagEditor,
}: {
  fileid: string;
  index: number;
  openFile: FileAction;
  openScrapePanel: FileAction;
  openJsonEditor: FileAction;
  openTagEditor: FileAction;
}) => {
  const { findById } = useFileRepository();
  const file = findById(fileid);
  const { streamingurl, mimetype, filename } = file;

  const openable = !!streamingurl;

  const openFilee = () => openFile(file);
  const openScrapePanell = () => openScrapePanel(file);
  const openJsonEditorr = () => openJsonEditor(file);
  const openTagEditorr = () => openTagEditor(file);

  return (
    <Box
      className={cls("card", mimetype)}
      bg={useColorModeValue("white", "gray.900")}
      boxShadow="xl"
      rounded="lg"
    >
      <VStack textAlign="center" p={6}>
        <label className={cls("filename", { clickable: openable })} onClick={openFilee}>
          <IndexLabel index={index} />
          {filename}
        </label>
        <Divider />
        <FileIcon f={file} />
        <Divider />
        <FileBadges f={file} />
        <HStack>
          <EditIcon className="clickable" onClick={openJsonEditorr} />
          <SearchIcon className="clickable" onClick={openScrapePanell} />
          <AttachmentIcon className="clickable" onClick={openTagEditorr} />
        </HStack>
      </VStack>
    </Box>
  );
};

export default Card;
