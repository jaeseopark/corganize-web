import React, { Dispatch, ReactNode, useReducer } from "react";

export type ToastType = "info" | "success" | "warning" | "error";

export type Toast = {
  id: string;
  type: ToastType;
  header: string;
  message: string;
  createdAt: number;
  onClick?: () => void;
};

type State = {
  toasts: Toast[];
};

type Action = { type: "ADD"; payload: Toast } | { type: "REMOVE"; payload: string };

export const Context = React.createContext<{
  state: State;
  dispatch?: Dispatch<Action>;
}>({
  state: { toasts: [] },
});

const reducer = (state: State, action: Action): State => {
  if (action.type === "ADD") {
    return {
      toasts: [...state.toasts, action.payload],
    };
  } else if (action.type === "REMOVE") {
    return {
      toasts: state.toasts.reduce((acc, next) => {
        if (next.id !== action.payload) {
          acc.push(next);
        }
        return acc;
      }, new Array<Toast>()),
    };
  }
  return state;
};

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { toasts: [] });

  const value = {
    state,
    dispatch,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default ToastProvider;
