import { useEffect } from "react";

import ToastPortal from "providers/toast/portal";
import { useFullscreen } from "./hook";
import { FullScreen } from "@chiragrupani/fullscreen-react";

const FullscreenPortal = () => {
  const { component, leaveFullscreen } = useFullscreen();

  return (
    <FullScreen
      isFullScreen={!!component}
      onChange={(isFullscreen) => {
        if (!isFullscreen) {
          leaveFullscreen();
        }
      }}
    >
      <ToastPortal />
      {component}
    </FullScreen>
  );
};

export default FullscreenPortal;
