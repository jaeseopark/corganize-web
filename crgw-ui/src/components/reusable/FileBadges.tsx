import { Badge as ChakraBadge, Wrap, WrapItem } from "@chakra-ui/react";
import cls, { Argument as ClsArg } from "classnames";

import { CorganizeFile, Multimedia, getActivationEmoji } from "typedefs/CorganizeFile";

import { useFileRepository } from "providers/fileRepository/hook";
import { useGrid } from "providers/grid/hook";
import { useToast } from "providers/toast/hook";

import { useNavv } from "hooks/navv";

import { closeEnough, toHumanDuration, toHumanFileSize } from "utils/numberUtils";

import "./FileBadges.scss";

type BadgeKey = keyof CorganizeFile | keyof Multimedia;
type Badge = {
  value: string;
  styleClasses?: ClsArg[];
};

const TagBadge = ({ tag }: { tag: string }) => {
  const {
    fieldProps: { setPrefilter },
  } = useGrid();
  const { loadFilesByTag } = useFileRepository();
  const { navRoot } = useNavv();
  const { enqueue } = useToast();

  const onClick = () => {
    const onFinsh = ({ count }: { count: number }) => {
      enqueue({ message: `${count} files added` });
      setPrefilter(tag);
      navRoot();
    };

    loadFilesByTag(tag).then(onFinsh);
  };

  return (
    <button className="file-tag clickable" onClick={onClick}>
      <ChakraBadge>{tag}</ChakraBadge>
    </button>
  );
};

const FileBadges = ({ f }: { f: CorganizeFile }) => {
  return (
    <Wrap as="div" className="file-badges" spacing="3px" justify="center">
      {Array.from(BADGE_GENERATION_MAP.entries()).map(([fieldName, func]) =>
        func(f).map(({ value, styleClasses }) => (
          <WrapItem key={value}>
            <ChakraBadge className={cls(fieldName, value, styleClasses)}>{value}</ChakraBadge>
          </WrapItem>
        ))
      )}
      {(f.tags || []).map((t) => (
        <WrapItem key={`tag-${t}`}>
          <TagBadge tag={t} />
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default FileBadges;

///////////////////////////////////////////////////////////////////////////////////////////////////

const BADGE_GENERATION_MAP: Map<BadgeKey, (f: CorganizeFile) => Badge[]> = new Map([
  [
    "dateactivated",
    (f) => [
      {
        value: getActivationEmoji(f),
        styleClasses: ["emoji", { active: !!f.dateactivated, inactive: !f.dateactivated }],
      },
    ],
  ],
  [
    "bookmarkexpiry",
    (f) => {
      if (!f.bookmarkexpiry) return [];
      return [
        {
          value: "📌",
          styleClasses: ["emoji"],
        },
      ];
    },
  ],
  [
    "highlights",
    (f) => {
      if (!f.multimedia?.highlights?.length) return [];
      return [
        {
          value: "⭐",
          styleClasses: ["emoji"],
        },
      ];
    },
  ],
  [
    "size",
    (f) => {
      const TOO_BIG = 2500000000; // 2.5GB

      if (!f.size) return [];
      return [
        {
          value: toHumanFileSize(f.size),
          styleClasses: [{ inadequate: TOO_BIG < f.size }],
        },
      ];
    },
  ],
  [
    "filecount",
    (f) => {
      const TOO_LOW = 15;
      if (!f.multimedia?.filecount) return [];
      return [
        {
          value: `${f.multimedia?.filecount}pcs`,
          styleClasses: [{ inadequate: f.multimedia.filecount < TOO_LOW }],
        },
      ];
    },
  ],
  [
    "width",
    (f) => {
      const badges: Badge[] = [];
      if (f.multimedia?.width) {
        const { width, height } = f.multimedia;
        const dimensions = [height!, width!];
        const isVertical = height! > width!;

        if (isVertical) {
          dimensions.reverse();
          badges.push({ value: "Vertical", styleClasses: ["orientation", "vertical"] });
        }

        const [short, long] = dimensions;
        const isCommonAspectRatio = closeEnough(long / short, 16 / 9, 0.15);

        if (isCommonAspectRatio) {
          badges.push({ value: `${short}p` });
        }
      }
      return badges;
    },
  ],
  [
    "duration",
    (f) => {
      const badges: Badge[] = [];
      if (f.multimedia?.duration) {
        const TOO_SHORT = 60;
        const TOO_LONG = 3600;

        badges.push({
          value: toHumanDuration(f.multimedia.duration),
          styleClasses: [
            {
              inadequate: TOO_SHORT > f.multimedia.duration || f.multimedia.duration > TOO_LONG,
            },
          ],
        });
        if (f.size) {
          const TOO_HIGH = 7000000; // 7Mbps

          const bitrate = (f.size / f.multimedia.duration) * 8;

          badges.push({
            value: `${Math.ceil(bitrate / 1000 ** 2)}Mbps`,
            styleClasses: ["bitrate", { inadequate: bitrate > TOO_HIGH }],
          });
        }
      }
      return badges;
    },
  ],
]);
