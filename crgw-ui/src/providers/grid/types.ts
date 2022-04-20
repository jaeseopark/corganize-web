import { CorganizeFile } from "typedefs/CorganizeFile";

export type Page = {
  index: number;
  itemsPerPage: number;
};

export type MaybeBoolean = "checked" | "unchecked" | "maybe";
export type SortDirection = "asc" | "desc";
export type SortOrder = {
  filter: Filter;
  direction: SortDirection;
};

export type Filter =
  | {
      type: "global";
      value: string;
      displayName: string;
      displayOrder?: number;
    }
  | {
      type: "boolean";
      fieldName: keyof CorganizeFile;
      value: MaybeBoolean;
      displayName: string;
      displayOrder?: number;
    }
  | {
      type: "dropdown";
      isActive: boolean;
      fieldName: keyof CorganizeFile;
      value: string;
      displayName: string;
      displayOrder?: number;
    };

export type State = {
  files: CorganizeFile[];
  filteredFiles: CorganizeFile[];
  filteredAndPaginatedFiles: CorganizeFile[];
  filters: Filter[];
  mostRecentFileid: string;
  page: Page;
  sortOrders: SortOrder[];
};

export type Action =
  | { type: "SET_FILES"; payload: CorganizeFile[] }
  | { type: "UPSERT_FILTERS"; payload: Filter[] }
  | { type: "SET_PAGE"; payload: Page }
  | { type: "SET_MOST_RECENT"; payload: string };
