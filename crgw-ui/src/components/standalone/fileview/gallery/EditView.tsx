import { Button, HStack } from "@chakra-ui/react";

import { GalleryProps, GalleryRenderer } from "./hook";

const EditControls = ({
  basicProps: { imageUrls },
  modeProps: { mode, enterThumbnailMode },
  highlightProps: { toggleAllHighlights, highlights },
}: GalleryProps) => {
  if (mode !== "edit") {
    return null;
  }

  return (
    <HStack className="edit-mode" spacing=".5em">
      <span className="counter">
        Highlighted: {highlights.length}/{imageUrls.length}
      </span>
      <Button tabIndex={-1} onClick={toggleAllHighlights}>
        Toggle All (A)
      </Button>
      <Button tabIndex={-1} onClick={enterThumbnailMode}>
        OK (⏎)
      </Button>
    </HStack>
  );
};

const EditViewHOC = (Inner: GalleryRenderer) => (props: GalleryProps) => {
  const {
    highlightProps: { toggleHighlightOnCurrentIndex, toggleAllHighlights },
  } = props;

  const handleKey = (key: string) => {
    if (key === "b") {
      toggleHighlightOnCurrentIndex();
    } else if (key === "a") {
      toggleAllHighlights();
    }
  };

  return (
    <div onKeyDown={(e) => handleKey(e.key.toLowerCase())}>
      <EditControls {...props} />
      <Inner {...props} />
    </div>
  );
};

export default EditViewHOC;
