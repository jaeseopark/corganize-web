import { CorganizeFile } from "typedefs/CorganizeFile";
import { createMegaFilter } from "./filter";
import { Action, Filter, Page, State } from "./types";

const filterAll = (
  files: CorganizeFile[],
  filters: Filter[]
): CorganizeFile[] => {
  const mergedFilter = createMegaFilter(filters);
  return files.filter(mergedFilter);
};

const paginate = (files: CorganizeFile[], page: Page) => {
  const offset = page.index * page.itemsPerPage;
  return files.slice(offset, offset + page.itemsPerPage);
};

const merge = (old: Filter[], neww: Filter[]): Filter[] =>
  neww.reduce(
    (acc, next) => {
      const i = acc.findIndex((f) => f.displayName === next.displayName);
      if (i === -1) {
        acc.push(next);
        return acc;
      }

      acc.splice(i, 1, next);
      return acc;
    },
    [...old]
  );

export const gridReducer = (
  {
    files,
    filteredFiles,
    filteredAndPaginatedFiles,
    mostRecentFileid,
    filters,
    page,
    sortOrders,
  }: State,
  action: Action
): State => {
  switch (action.type) {
    case "SET_FILES": {
      const newFilteredFiles = filterAll(action.payload, filters);
      return {
        files: action.payload,
        filteredFiles: newFilteredFiles,
        filteredAndPaginatedFiles: paginate(newFilteredFiles, page),
        mostRecentFileid,
        filters,
        page,
        sortOrders,
      };
    }
    case "UPSERT_FILTERS": {
      const newFilters = merge(filters, action.payload);
      const newFilteredFiles = filterAll(files, Object.values(newFilters));
      return {
        files,
        filteredFiles: newFilteredFiles,
        filteredAndPaginatedFiles: paginate(newFilteredFiles, page),
        mostRecentFileid,
        filters: newFilters,
        page,
        sortOrders,
      };
    }
    case "SET_PAGE":
      return {
        files,
        filteredFiles,
        filteredAndPaginatedFiles: paginate(filteredFiles, action.payload),
        mostRecentFileid,
        filters,
        page: action.payload,
        sortOrders,
      };
    case "SET_MOST_RECENT":
      return {
        files,
        filteredFiles,
        filteredAndPaginatedFiles,
        mostRecentFileid: action.payload,
        filters,
        page,
        sortOrders,
      };
    default:
      return {
        files,
        filteredFiles,
        filteredAndPaginatedFiles,
        mostRecentFileid,
        filters,
        page,
        sortOrders,
      };
  }
};
