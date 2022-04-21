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

const getNewPage = (oldPage: Page, fileCount: number): Page => {
  const { itemsPerPage, index } = oldPage;

  const getMaxIndex = () => {
    if (fileCount === 0) {
      return 0;
    }
    return Math.ceil(fileCount / itemsPerPage) - 1;
  };

  const maxIndex = getMaxIndex();

  return {
    ...oldPage,
    maxIndex,
    normalizedIndex: Math.min(maxIndex, index),
  };
};

const paginate = (files: CorganizeFile[], page: Page) => {
  const offset = page.normalizedIndex * page.itemsPerPage;
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
      const newPage = getNewPage(page, newFilteredFiles.length);
      return {
        files: action.payload,
        filteredFiles: newFilteredFiles,
        filteredAndPaginatedFiles: paginate(newFilteredFiles, newPage),
        mostRecentFileid,
        filters,
        page: newPage,
        sortOrders,
      };
    }
    case "UPSERT_FILTERS": {
      const newFilters = merge(filters, action.payload);
      const newFilteredFiles = filterAll(files, Object.values(newFilters));
      const newPage = getNewPage(page, newFilteredFiles.length);
      return {
        files,
        filteredFiles: newFilteredFiles,
        filteredAndPaginatedFiles: paginate(newFilteredFiles, newPage),
        mostRecentFileid,
        filters: newFilters,
        page: newPage,
        sortOrders,
      };
    }
    case "SET_PAGE":
      const newPage = getNewPage(action.payload, filteredFiles.length);
      return {
        files,
        filteredFiles,
        filteredAndPaginatedFiles: paginate(filteredFiles, newPage),
        mostRecentFileid,
        filters,
        page: newPage,
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
