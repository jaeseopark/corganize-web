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
      };
    }
    case "UPSERT_FILTER": {
      const newFilters: Filter[] = filters.reduce((acc, next) => {
        if (next.name === action.payload.name) {
          return [...acc, action.payload];
        }
        return [...acc, next];
      }, new Array<Filter>());
      const newFilteredFiles = filterAll(files, newFilters);
      return {
        files,
        filteredFiles: newFilteredFiles,
        filteredAndPaginatedFiles: paginate(newFilteredFiles, page),
        mostRecentFileid,
        filters: newFilters,
        page,
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
      };
    case "SET_MOST_RECENT":
      return {
        files,
        filteredFiles,
        filteredAndPaginatedFiles,
        mostRecentFileid: action.payload,
        filters,
        page,
      };
    default:
      return {
        files,
        filteredFiles,
        filteredAndPaginatedFiles,
        mostRecentFileid,
        filters,
        page,
      };
  }
};
