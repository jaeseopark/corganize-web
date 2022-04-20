import { Badge } from "@chakra-ui/react";
import { CorganizeFile } from "typedefs/CorganizeFile";

export const FileMetadataTag = () => {
  return <Badge></Badge>;
};

const FileMetadataTags = ({ f }: { f: CorganizeFile }) => {
  return <label>foobar</label>;
};

export default FileMetadataTags;
