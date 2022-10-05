import React, { Dispatch, useReducer } from "react";

import Fields from "providers/grid/fields";
import { EXPOSED_PRESETS } from "providers/grid/presets";
import { gridReducer } from "providers/grid/reducer";
import { Action, State } from "providers/grid/types";

const [defaultPreset] = EXPOSED_PRESETS;

const initialState: State = {
  files: [],
  filteredAndSorted: [],
  filteredSortedAndPaginated: [],
  fields: Object.values(Fields),
  filters: defaultPreset.filters,
  sorts: defaultPreset.sorts,
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
