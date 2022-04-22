import { Badge, Wrap, WrapItem } from "@chakra-ui/react";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { toHumanFileSize } from "utils/numberUtils";

const isVertical = (f: CorganizeFile) => {
  if (!f.multimedia) return false;
  const { width, height } = f.multimedia;
  return Boolean(width && height && width * 1.5 < height);
};

const toTags = (f: CorganizeFile): Array<string> => {
  const tags = [];
  if (f.mimetype) tags.push(f.mimetype);
  if (f.size) tags.push(toHumanFileSize(f.size));
  if (isVertical(f)) tags.push("Vertical");
  return tags;
};

export const FileMetadataTag = ({ tag }: { tag: string }) => {
  return <Badge>{tag}</Badge>;
};

const FileMetadataTags = ({ f }: { f: CorganizeFile }) => {
  return (
    <Wrap spacing="3px" justify="center">
      {toTags(f).map((t) => (
        <WrapItem key={t}>
          <FileMetadataTag tag={t} />
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default FileMetadataTags;
