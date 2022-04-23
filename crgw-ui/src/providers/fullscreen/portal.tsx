import { useEffect } from "react";

import ToastPortal from "providers/toast/portal";
import { useFullscreen } from "./hook";
import { FullScreen } from "@chiragrupani/fullscreen-react";

const FullscreenPortal = () => {
  const { component, leaveFullscreen } = useFullscreen();

  return { component };
};

export default FullscreenPortal;
