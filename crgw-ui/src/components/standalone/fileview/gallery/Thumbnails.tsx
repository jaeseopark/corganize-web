import { Box, SimpleGrid } from "@chakra-ui/react";
import cls from "classnames";
import { useEffect, useRef } from "react";

import { madFocus, scrollToElement } from "utils/elementUtils";

import Thumbnail from "components/standalone/fileview/gallery/Thumbnail";
import { GalleryProps } from "components/standalone/fileview/gallery/hook";

const Thumbnails = ({
  basicProps: { imageUrls, currentIndex },
  modeProps: { mode, enterLightboxMode },
  highlightProps: { isHighlighted },
}: GalleryProps) => {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const selectedImgRef = useRef<HTMLDivElement | null>(null);
  const isSummaryMode = mode === "summary";

  useEffect(() => {
    scrollToElement(selectedImgRef?.current);
  }, [currentIndex, mode]);

  useEffect(() => madFocus(mainRef?.current), [mainRef, mode]);

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
      ref={mainRef}
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
};

export default Thumbnails;
