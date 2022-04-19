import React, { useContext, useReducer } from "react";
import cls from "classnames";

import "./Blanket.scss";

type Payload = {
  title: JSX.Element;
  body: JSX.Element;
};

type State = {
  current?: Payload;
  isHotkeyEnabled: boolean;
};

type Action =
  | {
      type: "SET";
      payload: Payload;
    }
  | { type: "UNSET" }
  | { type: "SET_HOTKEY"; payload: boolean };

type Setter = (title: JSX.Element | string, body: JSX.Element) => void;

const initialState: State = {
  isHotkeyEnabled: true,
};

const BlanketContext = React.createContext<{
  state: State;
  setBlanket: Setter;
  exitBlanket: () => void;
  enableHotkey: () => void;
  disableHotkey: () => void;
}>({
  state: initialState,
  setBlanket: (t, s) => null,
  exitBlanket: () => null,
  enableHotkey: () => null,
  disableHotkey: () => null,
});

const blanketReducer = (
  { current, isHotkeyEnabled }: State,
  action: Action
): State => {
  switch (action.type) {
    case "SET":
      return {
        current: action.payload,
        isHotkeyEnabled,
      };
    case "UNSET":
      return { isHotkeyEnabled };
    case "SET_HOTKEY":
      return {
        current,
        isHotkeyEnabled: action.payload,
      };
    default:
      return { current, isHotkeyEnabled };
  }
};

const BlanketProvider = ({ children }: { children: JSX.Element }) => {
  const [state, dispatch] = useReducer(blanketReducer, initialState);

  const exitBlanket = () => dispatch({ type: "UNSET" });

  const setBlanket: Setter = (title, body) => {
    const payload = {
      title: typeof title === "string" ? <span>{title}</span> : title,
      body,
    };

    dispatch({ type: "SET", payload });
  };

  const enableHotkey = () => dispatch({ type: "SET_HOTKEY", payload: true });
  const disableHotkey = () => dispatch({ type: "SET_HOTKEY", payload: false });

  const maybeRenderBlanket = () => {
    if (!state.current) {
      return null;
    }

    return (
      <div className="blanket-view">
        <div className="blanket-header">
          <label className="blanket-title">{state.current.title}</label>
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={() => exitBlanket()}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="blanket-body">{state.current.body}</div>
      </div>
    );
  };

  const childrenClassName = cls("children", { hidden: !!state.current });
  const value = {
    state,
    setBlanket,
    exitBlanket,
    enableHotkey,
    disableHotkey,
  };

  return (
    <BlanketContext.Provider value={value}>
      <div className="blanket-provider">
        {maybeRenderBlanket()}
        <div className={childrenClassName}>{children}</div>
      </div>
    </BlanketContext.Provider>
  );
};

export const useBlanket = () => {
  const {
    state: { current },
    ...rest
  } = useContext(BlanketContext);

  return {
    isBlanketEnabled: !!current,
    ...rest,
  };
};

export default BlanketProvider;
