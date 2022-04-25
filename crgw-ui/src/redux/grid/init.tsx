import { Field, GridState } from "./types";

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
  sortType: "boolean",
};

const fieldMimetype: Field = {
  displayName: "Mimetype",
  key: "mimetype",
  filterType: "boolean", // TODO: change to dropdown later
  sortType: "string",
};

const fieldSize: Field = {
  displayName: "Size",
  key: "size",
  sortType: "number",
  filterType: "number",
};

export const initialState: GridState = {
  files: [],
  filteredAndSorted: [],
  filteredSortedAndPaginated: [],
  fields: [fieldNew, fieldLocal, fieldMimetype, fieldSize],
  filters: [
    {
      field: fieldNew,
      boolean: {
        value: "checked",
      },
    },
    {
      field: fieldLocal,
      boolean: {
        value: "checked",
      },
    },
    {
      field: fieldMimetype,
      boolean: {
        value: "checked",
      },
    },
  ],
  sorts: [
    {
      field: fieldSize,
      direction: "desc",
    },
  ],
  prefilter: "",
  page: {
    index: 0,
    normalizedIndex: 0,
    maxIndex: 0,
    itemsPerPage: 10,
  },
};
