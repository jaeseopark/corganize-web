import { Field } from "providers/grid/types";

export const fieldDateActivated: Field = {
  displayName: "Active",
  key: "dateactivated",
  filterType: "boolean",
  sortType: "number",
};

export const fieldNew: Field = {
  displayName: "New",
  key: "isnewfile",
  filterType: "boolean",
  sortType: "boolean",
};

export const fieldLastOpened: Field = {
  displayName: "Last Opened",
  key: "lastopened",
  sortType: "number",
  filterType: "number",
};

export const fieldMimetype: Field = {
  displayName: "Mimetype",
  key: "mimetype",
  filterType: "dropdown",
  sortType: "string",
};

export const fieldSize: Field = {
  displayName: "Size",
  key: "size",
  sortType: "number",
  filterType: "number",
};
