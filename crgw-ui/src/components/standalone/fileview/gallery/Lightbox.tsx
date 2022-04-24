import Img from "./Img";
import { GalleryContextProps, useGalleryContext } from "./state";

const Lightbox = ({ context }: { context: React.Context<GalleryContextProps> }) => {
  const {
    sourceProps: { selectedSource },
  } = useGalleryContext(context);

  return (
    <div className="lightbox">
      <Img src={selectedSource} />
    </div>
  );
};

export default Lightbox;
