import { Context, useEffect, useRef } from "react";
import cls from "classnames";
import { madFocus } from "utils/elementUtils";
import { GalleryContextProps, useGalleryContext } from "./state";

export type ImgProps = {
  index: number;
  src: string;
  context: Context<GalleryContextProps>;
};

const Img = ({ index, src, context }: ImgProps) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const {
    indexProps: { highlights, toggleHighlightByIndex, index: selectedIndex },
    modeProps: { mode },
  } = useGalleryContext(context);

  useEffect(() => {
    madFocus(imgRef.current);
  }, [index]);

  const isHighlighted = highlights.includes(index);
  const isSelected = selectedIndex === index;
  const onClick = () => {
    if (mode === "grid-bulk-highlight") {
      toggleHighlightByIndex(index);
    }
  };

  const c = cls({ selected: isSelected, highlighted: isHighlighted });
  return <img className={c} tabIndex={1} ref={imgRef} src={src} alt={src} onClick={onClick} />;
};

export default Img;
