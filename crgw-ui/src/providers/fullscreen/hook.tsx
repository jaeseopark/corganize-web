import { ReactNode, useContext } from "react";
import { FullscreenContext } from "./fullscreen";

export const useFullscreen = () => {
  const {
    state: { component },
    dispatch,
  } = useContext(FullscreenContext);
  const isFullscreen = !!component;

  const enterFullscreen = (newComponent: ReactNode) =>
    dispatch!({ type: "SET", payload: { component: newComponent } });

  const leaveFullscreen = () => dispatch!({ type: "SET", payload: {} });

  const toggleFullscreen = (newComponent?: ReactNode) => {
    if (isFullscreen) {
      leaveFullscreen();
    } else {
      enterFullscreen(newComponent!);
    }
  };

  return {
    component,
    isFullscreen,
    toggleFullscreen,
    enterFullscreen,
    leaveFullscreen,
  };
};
