import { Badge, Box } from "@chakra-ui/react";
import { CorganizeFile } from "typedefs/CorganizeFile";

const toTags = (f: CorganizeFile): string[] => {
  const tags = [];
  if (f.mimetype) tags.push(f.mimetype);
  return tags;
};

export const FileMetadataTag = ({ tag }: { tag: string }) => {
  return <Badge>{tag}</Badge>;
};

const FileMetadataTags = ({ f }: { f: CorganizeFile }) => {
  return (
    <Box>
      {toTags(f).map((t) => (
        <FileMetadataTag key={t} tag={t} />
      ))}
    </Box>
  );
};

export default FileMetadataTags;
