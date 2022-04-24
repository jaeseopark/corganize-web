import { Context } from "react";
import cls from "classnames";
import { GalleryContextProps, useGalleryContext } from "./state";

export type ImgProps = {
  context: Context<GalleryContextProps>;
  index: number;
  src: string;
};

const Img = ({ context, index, src }: ImgProps) => {
  const {
    indexProps: { highlights, toggleHighlightByIndex },
    modeProps: { mode },
  } = useGalleryContext(context);

  const isHighlighted = highlights.includes(index);
  const isSelected = index === index;
  const onClick = () => {
    if (mode === "grid-bulk-highlight") {
      toggleHighlightByIndex(index);
    }
  };

  const c = cls({ selected: isSelected, highlighted: isHighlighted });
  return <img className={c} src={src} alt={src} onClick={onClick} />;
};

export default Img;
