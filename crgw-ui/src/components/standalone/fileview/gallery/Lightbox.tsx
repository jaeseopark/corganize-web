import { Progress } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

import { madFocus } from "utils/elementUtils";

import { GalleryProps } from "./hook";

const Lightbox = ({
  basicProps: { imageUrls, currentIndex, incrementIndexWithWraparound },
  highlightProps: { setNextHighlightIndex },
  modeProps: { mode },
}: GalleryProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => madFocus(ref?.current), [ref, mode]);

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
      onKeyDown={(e) => handleKey(e.key.toLowerCase())}
      ref={ref}
    >
      <Progress value={(currentIndex * 100) / imageUrls.length} />
      <div className="lightbox">
        <img src={imageUrls[currentIndex]} />
      </div>
    </div>
  );
};

export default Lightbox;
