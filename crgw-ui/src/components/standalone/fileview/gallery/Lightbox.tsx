import { Progress, useMergeRefs } from "@chakra-ui/react";
import { forwardRef, useEffect, useRef } from "react";

import { madFocus } from "utils/elementUtils";

import { GalleryProps } from "components/standalone/fileview/gallery/hook";

const Lightbox = forwardRef(
  (
    {
      basicProps: { imageUrls, currentIndex, incrementIndexWithWraparound },
      highlightProps: { setNextHighlightIndex },
      modeProps: { mode },
    }: GalleryProps,
    ref,
  ) => {
    const localRef = useRef<HTMLDivElement | null>(null);
    const multiRef = useMergeRefs(localRef, ref);

    useEffect(() => madFocus(localRef?.current), [localRef, mode]);

    const handleKey = (key: string) => {
      if (key === "e") {
        setNextHighlightIndex();
      } else if (key === " ") {
        incrementIndexWithWraparound(1);
      }
    };

    return (
      <div
        className="lightbox-with-progress"
        tabIndex={1}
        onKeyDown={(e) => {
          if (e.shiftKey || e.ctrlKey) return;
          handleKey(e.key.toLowerCase());
        }}
        ref={multiRef}
      >
        <Progress value={(currentIndex * 100) / imageUrls.length} />
        <div className="lightbox">
          <img src={imageUrls[currentIndex]} />
        </div>
      </div>
    );
  },
);

export default Lightbox;
