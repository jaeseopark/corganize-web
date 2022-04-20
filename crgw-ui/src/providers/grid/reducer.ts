import { CorganizeFile } from "typedefs/CorganizeFile";
import { merge } from "./filter";
import { Action, Filter, Page, State } from "./types";

const filterAll = (
  files: CorganizeFile[],
  filters: Filter[]
): CorganizeFile[] => {
  const mergedFilter = merge(filters);
  return files.filter(mergedFilter);
};

const paginate = (files: CorganizeFile[], page: Page) => {
  const offset = page.index * page.itemsPerPage;
  return files.slice(offset, offset + page.itemsPerPage);
};

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
      const newFilters = [...action.payload, ...filters].reduce((acc, next) => {
        const match = acc.find((f) => f.name === next.name);
        if (!match) {
          acc.push(next);
        }
        return acc;
      }, new Array<Filter>());
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
