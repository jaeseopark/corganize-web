import React, { Dispatch, useReducer } from "react";
import cls from "classnames";

import "./blanket.scss";

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

const initialState: State = {
  isHotkeyEnabled: true,
};

export const BlanketContext = React.createContext<{
  state: State;
  dispatch?: Dispatch<Action>;
}>({ state: initialState });

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
            onClick={() => dispatch({ type: "UNSET" })}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="blanket-body">{state.current.body}</div>
      </div>
    );
  };

  const childrenClassName = cls("children", { hidden: !!state.current });

  return (
    <BlanketContext.Provider value={{ state, dispatch }}>
      <div className="blanket-provider">
        {maybeRenderBlanket()}
        <div className={childrenClassName}>{children}</div>
      </div>
    </BlanketContext.Provider>
  );
};

export default BlanketProvider;
