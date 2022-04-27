import cls from "classnames";

export type ThumbnailProps = {
  src: string;
  isHighlighted?: boolean;
  isCurrentIndex?: boolean;
  onClick?: () => void;
};

const Thumbnail = ({ src, isHighlighted, isCurrentIndex, onClick }: ThumbnailProps) => {
  const c = cls({ selected: isCurrentIndex, highlighted: isHighlighted });
  return <img className={c} src={src} alt={src} onClick={onClick} />;
};

export default Thumbnail;
