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
    filteredAndSorted,
    filteredSortedAndPaginated,
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
        filteredAndSorted: newFilteredFiles,
        filteredSortedAndPaginated: paginate(newFilteredFiles, newPage),
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
        filteredAndSorted: newFilteredFiles,
        filteredSortedAndPaginated: paginate(newFilteredFiles, newPage),
        filters: newFilters,
        page: newPage,
        sortOrders,
      };
    }
    case "SET_PAGE":
      const newPage = getNewPage(action.payload, filteredAndSorted.length);
      return {
        files,
        filteredAndSorted,
        filteredSortedAndPaginated: paginate(filteredAndSorted, newPage),
        filters,
        page: newPage,
        sortOrders,
      };
    case "SET_SORT_ORDERS":
      return {
        files,
        filteredAndSorted,
        filteredSortedAndPaginated,
        filters,
        page,
        sortOrders: action.payload
      }
    default:
      return {
        files,
        filteredAndSorted,
        filteredSortedAndPaginated,
        filters,
        page,
        sortOrders,
      };
  }
};
