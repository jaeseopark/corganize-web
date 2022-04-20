import React, { Dispatch, useReducer } from "react";
import { gridReducer } from "./reducer";
import { Action, State } from "./types";

const initialState: State = {
  files: [],
  filteredFiles: [],
  filteredAndPaginatedFiles: [],
  filters: [],
  mostRecentFileid: "",
  page: {
    index: 0,
    itemsPerPage: 10,
  },
};

export const GridContext = React.createContext<{
  state: State;
  dispatch?: Dispatch<Action>;
}>({
  state: initialState,
});

const GridProvider = ({ children }: { children: JSX.Element }) => {
  const [state, dispatch] = useReducer(gridReducer, initialState);
  const value = { state, dispatch };
  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
};

export default GridProvider;
