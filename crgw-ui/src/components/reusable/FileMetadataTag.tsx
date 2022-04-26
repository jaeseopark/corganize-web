import { Badge, Wrap, WrapItem } from "@chakra-ui/react";
import { CorganizeFile, getActivationEmoji, Multimedia } from "typedefs/CorganizeFile";
import { closeEnough, toHumanDuration, toHumanFileSize } from "utils/numberUtils";

const getHighlightEmoji = (f: CorganizeFile) => {
  if (f.multimedia?.highlights) {
    if (f.multimedia?.highlights.length > 0) {
      return ["⭐"];
    }
  }
  return [];
};

const getResolutionTags = (f: CorganizeFile): string[] => {
  const tags: string[] = [];
  if (f.multimedia?.width) {
    const { width, height } = f.multimedia;
    const dimensions = [height!, width!];
    const isVertical = height! > width!;

    if (isVertical) {
      dimensions.reverse();
      tags.push("Vertical");
    }

    const [short, long] = dimensions;
    const isCommonAspectRatio = closeEnough(long / short, 16 / 9, 0.15);

    if (isCommonAspectRatio) {
      tags.push(`${short}p`);
    }
  }
  return tags;
};

const getDurationTags = (f: CorganizeFile): string[] => {
  const tags: string[] = [];
  if (f.multimedia?.duration) {
    tags.push(toHumanDuration(f.multimedia?.duration));
    if (f.size) {
      const bitrate = Math.ceil((f.size! / 1024 ** 2 / f.multimedia?.duration) * 8);
      tags.push(`${bitrate}Mbps`);
    }
  }
  return tags;
};

type TagType = keyof CorganizeFile | keyof Multimedia;
const TAG_GENERATION_MAP: Map<TagType, (f: CorganizeFile) => string[]> = new Map([
  ["dateactivated", (f) => [getActivationEmoji(f)]],
  ["highlights", (f) => getHighlightEmoji(f)],
  ["mimetype", (f) => (f.mimetype ? [f.mimetype] : [])],
  ["size", (f) => (f.size ? [toHumanFileSize(f.size!)] : [])],
  ["filecount", (f) => (f.multimedia?.filecount ? [`${f.multimedia?.filecount}pcs`] : [])],
  ["width", getResolutionTags],
  ["duration", getDurationTags],
]);

const FileMetadataTags = ({ f }: { f: CorganizeFile }) => {
  const tags = Array.from(TAG_GENERATION_MAP.values()).flatMap((func) => func(f));
  return (
    <Wrap spacing="3px" justify="center">
      {tags.map((t) => (
        <WrapItem key={t}>
          <Badge>{t}</Badge>
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default FileMetadataTags;
