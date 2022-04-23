import React, { Dispatch, ReactNode, useReducer } from "react";

type State = {
  component?: ReactNode;
};

type Action = { type: "SET"; payload: State };

export const FullscreenContext = React.createContext<{
  state: State;
  dispatch?: Dispatch<Action>;
}>({
  state: {},
});

const reducer = (state: State, action: Action): State => {
  if (action.type === "SET") {
    return action.payload;
  }
  return state;
};

const FullscreenProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, {});

  const value = {
    state,
    dispatch,
  };

  return <FullscreenContext.Provider value={value}>{children}</FullscreenContext.Provider>;
};

export default FullscreenProvider;
