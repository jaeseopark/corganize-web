import { CorganizeFile } from "typedefs/CorganizeFile";

export type Page = {
  index: number;
  // applying filters can cause situations where index > maxIndex.
  // This property allows the index to gracefully decrement while allowing the user to go back to the original index upon removing the filters.
  normalizedIndex: number;
  maxIndex: number;
  itemsPerPage: number;
};

export type MaybeBoolean = "checked" | "unchecked" | "maybe";
export type SortDirection = "asc" | "desc";
export type SortOrder = {
  filter: Filter;
  direction: SortDirection;
};
export type GlobalSearchFilter = {
  type: "global";
  value: string;
  displayName: string;
};

export type BooleanFilter = {
  type: "boolean";
  fieldName: keyof CorganizeFile;
  value: MaybeBoolean;
  displayName: string;
};

export type DropdownFilter = {
  type: "dropdown";
  isActive: boolean;
  fieldName: keyof CorganizeFile;
  value: string;
  displayName: string;
};

export type NumberFilter = {
  type: "number";
  isActive: boolean;
  fieldName: keyof CorganizeFile;
  value1: number;
  value2: number;
  displayName: string;
};

export type Filter =
  | GlobalSearchFilter
  | BooleanFilter
  | DropdownFilter
  | NumberFilter;

export type State = {
  files: CorganizeFile[];
  filteredAndSorted: CorganizeFile[];
  filteredSortedAndPaginated: CorganizeFile[];
  filters: Filter[];
  page: Page;
  sortOrders: SortOrder[];
};

export type Action =
  | { type: "SET_FILES"; payload: CorganizeFile[] }
  | { type: "UPSERT_FILTERS"; payload: Filter[] }
  | { type: "SET_SORT_ORDERS"; payload: SortOrder[] }
  | { type: "SET_PAGE"; payload: Page }
  | { type: "SET_MOST_RECENT"; payload: string };
