import React, { Dispatch, useReducer } from "react";
import { gridReducer } from "./reducer";
import { Action, Field, State } from "./types";

const fieldNew: Field = {
  displayName: "New",
  key: "isnewfile",
  filterType: "boolean",
  sortType: "boolean",
};

const fieldLocal: Field = {
  displayName: "Local",
  key: "streamingurl",
  filterType: "boolean",
  sortType: "boolean"
};

const fieldMimetype: Field = {
  displayName: "Mimetype",
  key: "mimetype",
  filterType: "boolean", // TODO: change to dropdown later
  sortType: "string"
};

const fieldSize: Field = {
  displayName: "Size",
  key: "size",
  sortType: "number",
  filterType: "number",
};

const initialState: State = {
  files: [],
  filteredAndSorted: [],
  filteredSortedAndPaginated: [],
  fields: [
    fieldNew,
    fieldLocal,
    fieldMimetype,
    fieldSize
  ],
  filters: [
    {
      field: fieldNew,
      boolean: {
        value: "checked"
      }
    },
    {
      field: fieldLocal,
      boolean: {
        value: "checked"
      }
    },
    {
      field: fieldMimetype,
      boolean: {
        value: "checked"
      }
    }
  ],
  sorts: [{
    field: fieldSize,
    direction: "desc"
  }],
  prefilter: "",
  page: {
    index: 0,
    normalizedIndex: 0,
    maxIndex: 0,
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
