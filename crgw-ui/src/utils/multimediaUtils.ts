import { CorganizeFile } from "typedefs/CorganizeFile";
import { closeEnough } from "utils/numberUtils";

export const getVideoMetadata = (file: CorganizeFile) => {
  if (!file.multimedia?.duration) return null;

  // note: when duration exists, width and height also exist.
  const { width, height, duration, highlights } = file.multimedia;
  const dimensions = [height!, width!];
  const isVertical = height! > width!;

  // Expressed in Megabits per second.
  const bitrate = Math.ceil((file.size! / 1024 ** 2 / duration) * 8);

  if (isVertical) dimensions.reverse();

  const [short, long] = dimensions;
  const isCommonAspectRatio = closeEnough(long / short, 16 / 9, 0.15);

  return {
    isVertical,
    resolution: isCommonAspectRatio ? `${short}p` : null,
    bitrate: `${bitrate}Mbps`,
    highlights,
  };
};
