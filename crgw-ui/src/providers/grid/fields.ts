import { Field } from "providers/grid/types";

const fieldDateActivated: Field = {
  displayName: "Active",
  key: "dateactivated",
  filterType: "boolean",
  sortType: "number",
};

const fieldNew: Field = {
  displayName: "New",
  key: "isnewfile",
  filterType: "boolean",
  sortType: "boolean",
};

const fieldLastOpened: Field = {
  displayName: "Last Opened",
  key: "lastopened",
  sortType: "number",
  filterType: "number",
};

const fieldMimetype: Field = {
  displayName: "Mimetype",
  key: "mimetype",
  filterType: "dropdown",
  sortType: "string",
};

const fieldSize: Field = {
  displayName: "Size",
  key: "size",
  sortType: "number",
  filterType: "number",
};

const fieldTags: Field = {
  displayName: "Tags",
  key: "tags",
  sortType: "boolean",
  filterType: "boolean",
};

const fieldBookmark: Field = {
  displayName: "Bookmark",
  key: "bookmarkexpiry",
  "sortType": "boolean",
  filterType: "boolean"
}

const fieldDuration: Field = {
  displayName: "Duration",
  key: "multimedia",
  nestedKey: "duration",
  sortType: "number",
  filterType: "number",
};

export default {
  fieldDateActivated,
  fieldNew,
  fieldLastOpened,
  fieldMimetype,
  fieldSize,
  fieldTags,
  fieldBookmark,
  fieldDuration
};
