import React, { Dispatch, useReducer } from "react";

export type UserAction = {
  name: string;
  icon: JSX.Element;
  onClick: () => void;
};

type BlanketPayload = {
  title: string;
  body: JSX.Element;
  userActions: UserAction[];
  onClose?: () => void;
};

type State = {
  title?: string;
  body?: JSX.Element;
  isHotkeyEnabled: boolean;
  userActions: UserAction[];
  onClose?: () => void;
};

type ReducerAction =
  | {
      type: "SET";
      payload: BlanketPayload;
    }
  | { type: "ADD_USER_ACTION"; payload: UserAction }
  | { type: "UNSET" }
  | { type: "SET_HOTKEY"; payload: boolean };

const initialState: State = {
  isHotkeyEnabled: true,
  userActions: [],
};

export const BlanketContext = React.createContext<{
  state: State;
  dispatch?: Dispatch<ReducerAction>;
}>({ state: initialState });

const blanketReducer = (
  { title, body, isHotkeyEnabled, userActions, onClose }: State,
  action: ReducerAction
): State => {
  switch (action.type) {
    case "SET":
      return {
        title: action.payload.title,
        body: action.payload.body,
        userActions: action.payload.userActions,
        isHotkeyEnabled: true,
        onClose: action.payload.onClose,
      };
    case "UNSET":
      if (onClose) {
        onClose();
      }
      return { isHotkeyEnabled: false, userActions: [] };
    case "ADD_USER_ACTION":
      return {
        title,
        body,
        isHotkeyEnabled,
        userActions: [...userActions, action.payload],
        onClose,
      };
    case "SET_HOTKEY":
      return {
        title,
        body,
        isHotkeyEnabled: action.payload,
        userActions,
        onClose,
      };
    default:
      return { title, body, isHotkeyEnabled, userActions, onClose };
  }
};

const BlanketProvider = ({ children }: { children: JSX.Element }) => {
  const [state, dispatch] = useReducer(blanketReducer, initialState);
  return <BlanketContext.Provider value={{ state, dispatch }}>{children}</BlanketContext.Provider>;
};

export default BlanketProvider;
