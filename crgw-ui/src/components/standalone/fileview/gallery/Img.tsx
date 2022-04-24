import { forwardRef } from "react";
import cls from "classnames";

export type ImgProps = {
  src: string;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
};

const Img = forwardRef(({ src, isHighlighted, isSelected, onClick }: ImgProps, ref) => {
  const c = cls({ selected: isSelected, highlighted: isHighlighted });
  return (
    // @ts-ignore
    <img className={c} src={src} alt={src} onClick={onClick} ref={ref} />
  );
});

export default Img;
