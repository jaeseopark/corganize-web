import { GalleryProps, GalleryRenderer } from "components/standalone/fileview/gallery/hook";

const SummaryViewHOC = (Inner: GalleryRenderer) => (props: GalleryProps) => {
  return (
    <div className="summary-view">
      <Inner {...props} />
    </div>
  );
};

export default SummaryViewHOC;
