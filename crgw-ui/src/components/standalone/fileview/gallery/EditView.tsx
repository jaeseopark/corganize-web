import { Button, HStack } from "@chakra-ui/react";
import { ForwardRefExoticComponent, Ref, forwardRef } from "react";

import { GalleryProps } from "components/standalone/fileview/gallery/hook";

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

const EditViewHOC = (Inner: ForwardRefExoticComponent<any>) =>
  forwardRef((props: GalleryProps, ref: Ref<HTMLDivElement>) => {
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
      <div
        onKeyDown={(e) => {
          if (e.shiftKey || e.ctrlKey) return;
          handleKey(e.key.toLowerCase());
        }}
      >
        <EditControls {...props} />
        <Inner {...props} ref={ref} />
      </div>
    );
  });

export default EditViewHOC;
