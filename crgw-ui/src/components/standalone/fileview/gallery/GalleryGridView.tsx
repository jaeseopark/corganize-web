import { Box, SimpleGrid } from "@chakra-ui/react";

import Img from "./Img";
import { GalleryContextProps, useGalleryContext } from "./state";

const GRID_CELL_MIN_WIDTH = "120px";
const GRID_CELL_MAX_WIDTH = "400px";
const GRID_CELL_MAX_HEIGHT = "20vh";

const GalleryGridView = ({ context }: { context: React.Context<GalleryContextProps> }) => {
  const {
    modeProps: { mode },
    sourceProps: { sources },
  } = useGalleryContext(context);

  if (mode === "lightbox") {
    return null;
  }

  const toggleAllHighlights = () => {
    const shouldClear = highlightManager.highlights.length === srcs.length;
    if (shouldClear) {
      highlightManager.clear();
    } else {
      createRange(0, srcs.length - 1).forEach((i) => highlightManager.add(i));
    }
    rerender();
  };

  useEffect(() => {
    const element = selectedImgRef?.current;
    if (!isLightboxEnabled && element && (element as any) instanceof HTMLElement) {
      (element as HTMLElement).scrollIntoView();
    }
  }, [currentIndex, isLightboxEnabled]);

  // const rerender = () => setLastBulkHighlightActivity(getPosixMilliseconds());

  // const toggleHighlight = (index: number) => {
  //   // The first line isn't going to cause a rerender because the pointers stay unchanged.
  //   highlightManager.toggle(index);
  //   rerender();
  // };

  const handleGridKey = (key: string) => {
    const handleGridKey = (key: string) => {
      if (key === "g") {
        enterLightboxMode();
      } else if (key === "a") {
        hMan.toggleAllHighlights();
        if (mode === "grid-bulk-highlight") {
          saveHighlights();
        }
      } else if (key === "b") {
        toggleHighlight(currentIndex);
        saveHighlights();
      } else if (key === "enter") {
        enterHighlightMode();
      } else if (key === " ") {
        enterLightboxMode();
      }
    };

    const handleBulkKey = (key: string) => {
      } else if (key === "b") {
        toggleHighlight(currentIndex);
        if (!isBulkHighlightMode) {
          saveHighlights();
        }
      } else if (key === "enter") {
        enterGridMode();
      }
    };
  };

  return (
    <SimpleGrid
      minChildWidth={GRID_CELL_MIN_WIDTH}
      spacing={6}
      onKeyDown={(e) => handleGridKey(e.key.toLowerCase())}
    >
      {sources.map((src, i) => {
        const isSelected = index === i;
        return (
          <Box key={src} bg="white" maxHeight={GRID_CELL_MAX_HEIGHT} maxW={GRID_CELL_MAX_WIDTH}>
            <Img
              src={src}
              isHighlighted={highlightManager.isHighlighted(i)}
              isSelected={isSelected}
              onClick={() => {
                if (isBulkHighlightMode) {
                  toggleHighlight(i);
                }
              }}
            />
          </Box>
        );
      })}
    </SimpleGrid>
  );
};

export default GalleryGridView;
