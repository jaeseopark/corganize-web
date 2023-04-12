import { Box, SimpleGrid, useMergeRefs } from "@chakra-ui/react";
import cls from "classnames";
import { Ref, forwardRef, useEffect, useRef } from "react";

import { madFocus, scrollToElement } from "utils/elementUtils";

import Thumbnail from "components/standalone/fileview/gallery/Thumbnail";
import { GalleryProps } from "components/standalone/fileview/gallery/hook";

const Thumbnails = forwardRef(
  (
    {
      basicProps: { imageUrls, currentIndex },
      modeProps: { mode, enterLightboxMode },
      highlightProps: { isHighlighted },
    }: GalleryProps,
    ref: Ref<HTMLDivElement>
  ) => {
    const localRef = useRef<HTMLDivElement | null>(null);
    const selectedImgRef = useRef<HTMLDivElement | null>(null);
    const isSummaryMode = mode === "summary";
    const multiRef = useMergeRefs(localRef, ref);

    useEffect(() => {
      scrollToElement(selectedImgRef?.current);
    }, [currentIndex, mode]);

    useEffect(() => madFocus(localRef?.current), [localRef, mode]);
    const handleKey = (key: string) => {
      if (key === " ") {
        enterLightboxMode();
      }
    };

    return (
      <SimpleGrid
        className={cls("thumbnails-view", { "summary-mode": isSummaryMode })}
        minChildWidth={isSummaryMode ? "150px" : "400px"}
        spacing={isSummaryMode ? 2 : 6}
        tabIndex={1}
        ref={multiRef}
        onKeyDown={(e) => {
          if (e.shiftKey || e.ctrlKey) return;
          handleKey(e.key.toLowerCase());
        }}
      >
        {imageUrls.map((src, i) => {
          const isCurrent = i === currentIndex;
          const ref = isCurrent ? selectedImgRef : undefined;
          return (
            <Box key={src} bg="white" ref={ref}>
              <Thumbnail src={src} isHighlighted={isHighlighted(i)} isCurrentIndex={isCurrent} />
            </Box>
          );
        })}
      </SimpleGrid>
    );
  }
);

export default Thumbnails;
