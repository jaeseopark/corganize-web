import { CorganizeFile } from "typedefs/CorganizeFile";

/**
 * Field-related items
 */
export type SortType = "number" | "boolean" | "string";
export type FilterType = "number" | "boolean" | "dropdown";
export type Field = {
  key: keyof CorganizeFile;
  displayName: string;
  filterType: FilterType;
  sortType: SortType;
}

export interface FieldReferer {
  field: Field;
};

/**
 * Filter-related items
 */

export type MaybeBoolean = "checked" | "unchecked" | "maybe";
export type BooleanFilter = {
  value: MaybeBoolean;
};

export type DropdownFilter = {
  value: string;
};

export type NumberFilter = {
  value1: number;
  value2: number;
};

export interface Filter extends FieldReferer {
  number?: NumberFilter,
  boolean?: BooleanFilter
  dropdown?: DropdownFilter
}

/**
 * Sort-related items
 */
export type SortDirection = "asc" | "desc";
export interface Sort extends FieldReferer {
  direction: SortDirection;
};

/**
 * Page-related items
 */
export type Page = {
  index: number;
  // applying filters can cause situations where index > maxIndex.
  // This property allows the index to gracefully decrement while allowing the user to go back to the original index upon removing the filters.
  normalizedIndex: number;
  maxIndex: number;
  itemsPerPage: number;
};

/**
 *  Reducer boilerplate
 */
export type State = {
  files: CorganizeFile[];
  filteredAndSorted: CorganizeFile[];
  filteredSortedAndPaginated: CorganizeFile[];
  fields: Field[],
  filters: Filter[],
  sorts: Sort[],
  prefilter: string,
  page: Page;
};

export type Action =
  | { type: "SET_FILES"; payload: CorganizeFile[] }
  | { type: "UPSERT_FILTERS"; payload: Filter[] }
  | { type: "REMOVE_FILTERS"; payload: Filter[] }
  | { type: "UPSERT_SORTS"; payload: Sort[] }
  | { type: "REMOVE_SORTS"; payload: Sort[] }
  | { type: "SET_PREFILTER"; payload: string }
  | { type: "SET_PAGE"; payload: Page };
