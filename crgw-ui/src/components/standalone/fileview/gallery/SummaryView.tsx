import { ForwardRefExoticComponent, Ref, forwardRef } from "react";

import { GalleryProps } from "components/standalone/fileview/gallery/hook";

const SummaryViewHOC = (Inner: ForwardRefExoticComponent<any>) =>
  forwardRef((props: GalleryProps, ref: Ref<HTMLDivElement>) => {
    return (
      <div className="summary-view">
        <Inner {...props} />
      </div>
    );
  });

export default SummaryViewHOC;
