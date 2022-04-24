import { GalleryContextProps, useGalleryContext } from "./state";
import Img from "./Img";

const Lightbox = ({ context }: { context: React.Context<GalleryContextProps> }) => {
  const {
    sourceProps: { selectedSource },
    modeProps: { enterGridMode, enterHighlightMode },
    indexProps: { index, incrementIndex, jumpToNextSnippet },
  } = useGalleryContext(context);

  const handleLightboxKey = (key: string) => {
    if (key === "g") {
      enterGridMode();
    } else if (key === "b") {
      enterHighlightMode();
    } else if (key === " ") {
      incrementIndex(1);
    } else if (key === "e") {
      jumpToNextSnippet();
    }
  };

  return (
    <div className="lightbox" onKeyDown={(e) => handleLightboxKey(e.key.toLowerCase())}>
      <Img context={context} index={index} src={selectedSource} />
    </div>
  );
};

export default Lightbox;
