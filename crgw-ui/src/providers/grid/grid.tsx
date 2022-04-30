import React, { Dispatch, useReducer } from "react";

import { gridReducer } from "providers/grid/reducer";
import { Action, State } from "providers/grid/types";

import { fieldDateActivated, fieldLastOpened, fieldMimetype, fieldNew, fieldSize } from "./fields";

const initialState: State = {
  files: [],
  filteredAndSorted: [],
  filteredSortedAndPaginated: [],
  fields: [fieldNew, fieldDateActivated, fieldLastOpened, fieldMimetype, fieldSize],
  filters: [],
  sorts: [],
  prefilter: "",
  page: {
    index: 0,
    normalizedIndex: 0,
    maxIndex: 0,
    itemsPerPage: 20,
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
