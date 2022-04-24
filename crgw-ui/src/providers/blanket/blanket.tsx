import React, { Dispatch, useReducer } from "react";

export type UserAction = {
  name: string;
  icon?: JSX.Element;
  onClick: () => void;
};

type BlanketPayload = {
  title: string;
  body: JSX.Element;
  userActions: UserAction[];
  onClose?: () => void;
};

export type BlanketState = {
  title?: string;
  body?: JSX.Element;
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

const initialState: BlanketState = {
  userActions: [],
};

export const BlanketContext = React.createContext<{
  state: BlanketState;
  dispatch?: Dispatch<ReducerAction>;
}>({ state: initialState });

const blanketReducer = (
  { title, body, userActions, onClose }: BlanketState,
  action: ReducerAction
): BlanketState => {
  switch (action.type) {
    case "SET":
      return {
        title: action.payload.title,
        body: action.payload.body,
        userActions: action.payload.userActions,
        onClose: action.payload.onClose,
      };
    case "UNSET":
      if (onClose) {
        onClose();
      }
      return { userActions: [] };
    case "ADD_USER_ACTION":
      return {
        title,
        body,
        userActions: [...userActions, action.payload],
        onClose,
      };
    default:
      return { title, body, userActions, onClose };
  }
};

const BlanketProvider = ({ children }: { children: JSX.Element }) => {
  const [state, dispatch] = useReducer(blanketReducer, initialState);
  return <BlanketContext.Provider value={{ state, dispatch }}>{children}</BlanketContext.Provider>;
};

export default BlanketProvider;
