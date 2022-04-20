import { CorganizeFile } from "typedefs/CorganizeFile";

export type Page = {
  index: number;
  itemsPerPage: number;
};

export type MaybeBoolean = "checked" | "unchecked" | "maybe";

export type Filter =
  | {
      name: string;
      type: "global";
      value?: string;
    }
  | {
      name: string;
      type: "boolean";
      fieldName: keyof CorganizeFile;
      value: MaybeBoolean;
    }
  | {
      name: string;
      type: "dropdown";
      isActive: boolean;
      fieldName: keyof CorganizeFile;
      value: string;
    };

export type State = {
  files: CorganizeFile[];
  filteredFiles: CorganizeFile[];
  filteredAndPaginatedFiles: CorganizeFile[];
  filters: Filter[];
  mostRecentFileid: string;
  page: Page;
};

export type Action =
  | { type: "SET_FILES"; payload: CorganizeFile[] }
  | { type: "UPSERT_FILTER"; payload: Filter }
  | { type: "SET_PAGE"; payload: Page }
  | { type: "SET_MOST_RECENT"; payload: string };
