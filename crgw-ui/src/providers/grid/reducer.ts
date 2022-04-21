import { CorganizeFile } from "typedefs/CorganizeFile";
import { createMegaFilter } from "./filter";
import { createMegaComparer } from "./sort";
import { Action, Filter, Page, State } from "./types";

const mergeFilters = (old: Filter[], neww: Filter[]): Filter[] =>
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
      const newFilteredAndSorted = action.payload
        .filter(createMegaFilter(filters))
        .sort(createMegaComparer(sortOrders));
      const newPage = getNewPage(page, newFilteredAndSorted.length);
      return {
        files: action.payload,
        filteredAndSorted: newFilteredAndSorted,
        filteredSortedAndPaginated: paginate(newFilteredAndSorted, newPage),
        filters,
        page: newPage,
        sortOrders,
      };
    }
    case "UPSERT_FILTERS": {
      const newFilters = mergeFilters(filters, action.payload);
      const newFilteredAndSorted = files
        .filter(createMegaFilter(Object.values(newFilters)))
        .sort(createMegaComparer(sortOrders));
      const newPage = getNewPage(page, newFilteredAndSorted.length);
      return {
        files,
        filteredAndSorted: newFilteredAndSorted,
        filteredSortedAndPaginated: paginate(newFilteredAndSorted, newPage),
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
      const newSortOrders = action.payload;
      const newFilteredAndSorted = filteredAndSorted.sort(createMegaComparer(newSortOrders))
      return {
        files,
        filteredAndSorted: newFilteredAndSorted,
        filteredSortedAndPaginated: paginate(newFilteredAndSorted, page),
        filters,
        page,
        sortOrders: newSortOrders
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
