import { Box, SimpleGrid } from "@chakra-ui/react";
import { Context, useEffect, useRef } from "react";

import Img from "./Img";
import { GalleryContextProps, useGalleryContext } from "./state";

const GalleryGridView = ({ context }: { context: Context<GalleryContextProps> }) => {
  const selectedImgRef = useRef<HTMLDivElement | null>(null);
  const {
    modeProps: { mode, enterLightboxMode, enterGridMode, enterHighlightMode },
    sourceProps: { sources },
    indexProps: { index, toggleAllHighlights, toggleHighlight },
  } = useGalleryContext(context);

  useEffect(() => {
    const element = selectedImgRef?.current;
    if (element) {
      (element as HTMLElement).scrollIntoView();
    }
  }, [index]);

  const handleGridKey = (key: string) => {
    if (["g", " ", "e"].includes(key)) {
      enterLightboxMode();
    } else if (key === "a") {
      if (mode === "grid-bulk-highlight") {
        toggleAllHighlights();
      }
    } else if (key === "b") {
      if (mode === "grid-bulk-highlight") {
        toggleHighlight();
      }
    } else if (key === "enter") {
      if (mode === "grid-bulk-highlight") {
        enterGridMode();
      } else {
        enterHighlightMode();
      }
    }
  };

  if (mode === "lightbox") {
    return null;
  }

  return (
    <SimpleGrid
      minChildWidth="400px"
      spacing={6}
      onKeyDown={(e) => handleGridKey(e.key.toLowerCase())}
      tabIndex={1}
    >
      {sources.map((src, i) => (
        <Box key={src} bg="white" ref={selectedImgRef}>
          <Img context={context} index={i} src={src} />
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default GalleryGridView;
