import { BlanketContext } from "providers/blanket";
import { useContext } from "react";

type Setter = (title: JSX.Element | string, body: JSX.Element) => void;

export const useBlanket = () => {
  const { state, dispatch } = useContext(BlanketContext);
  const exitBlanket = () => dispatch!({ type: "UNSET" });

  const setBlanket: Setter = (title, body) => {
    const payload = {
      title: typeof title === "string" ? <span>{title}</span> : title,
      body,
    };

    dispatch!({ type: "SET", payload });
  };

  const enableHotkey = () => dispatch!({ type: "SET_HOTKEY", payload: true });
  const disableHotkey = () => dispatch!({ type: "SET_HOTKEY", payload: false });

  return {
    isBlanketEnabled: !!state.current,
    setBlanket,
    exitBlanket,
    enableHotkey,
    disableHotkey,
  };
};
