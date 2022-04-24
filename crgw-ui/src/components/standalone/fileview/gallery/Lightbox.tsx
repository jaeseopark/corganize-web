import { Context } from "react";
import Img from "./Img";
import { GalleryContextProps, useGalleryContext } from "./state";

const Lightbox = ({ context }: { context: Context<GalleryContextProps> }) => {
  const {
    sourceProps: { selectedSource },
    modeProps: { mode, enterGridMode, enterHighlightMode },
    indexProps: { index, incrementIndex, jumpToNextSnippet },
  } = useGalleryContext(context);

  const handleLightboxKey = (key: string) => {
    if (key === "g") {
      enterGridMode();
    } else if (["b", "enter"].includes(key)) {
      enterHighlightMode();
    } else if (key === " ") {
      incrementIndex(1);
    } else if (key === "e") {
      jumpToNextSnippet();
    }
  };

  if (mode !== "lightbox") {
    return null;
  }

  return (
    <div
      className="lightbox"
      tabIndex={1}
      onKeyDown={(e) => handleLightboxKey(e.key.toLowerCase())}
    >
      <Img context={context} index={index} src={selectedSource} />
    </div>
  );
};

export default Lightbox;
