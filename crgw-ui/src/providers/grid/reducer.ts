import { CorganizeFile } from "typedefs/CorganizeFile";
import { createMegaFilter } from "./filter";
import { createMegaComparer } from "./sort";
import { Action, FieldReferer, Page, Sort, State } from "./types";

const merge = (old: FieldReferer[], neww: FieldReferer[]) =>
  neww.reduce(
    (acc, next) => {
      const i = acc.findIndex((f) => f.field.displayName === next.field.displayName);
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

const recompute = (state: State): State => {
  const { files, filters, prefilter, sorts, page } = state;
  const newFilteredAndSorted = files.filter(createMegaFilter(filters, prefilter)).sort(createMegaComparer(sorts));
  const newPage = getNewPage(page, newFilteredAndSorted.length);
  const newFilteredSortedAndPaginated = paginate(newFilteredAndSorted, newPage);
  return {
    ...state,
    filteredAndSorted: newFilteredAndSorted,
    filteredSortedAndPaginated: newFilteredSortedAndPaginated,
    page: newPage,
  };
};

export const gridReducer = (state: State, action: Action): State => {
  const { filteredAndSorted, filters, sorts } = state;

  switch (action.type) {
    case "SET_FILES": {
      return recompute({
        ...state,
        files: action.payload,
      });
    }
    case "UPSERT_FILTERS": {
      const newFilters = merge(filters, action.payload);
      return recompute({
        ...state,
        filters: newFilters,
      });
    }
    case "REMOVE_FILTERS": {
      const fieldNamesToRemove = new Set(action.payload.map((flt) => flt.field.displayName));
      const newFilters = filters.filter((f) => !fieldNamesToRemove.has(f.field.displayName));
      return recompute({
        ...state,
        filters: newFilters,
      });
    }
    case "UPSERT_SORTS": {
      const newSorts = merge(sorts, action.payload) as Sort[];
      return recompute({
        ...state,
        sorts: newSorts,
      });
    }
    case "REMOVE_SORTS": {
      const fieldNamesToRemove = new Set(action.payload.map((flt) => flt.field.displayName));
      const newSorts = sorts.filter((f) => !fieldNamesToRemove.has(f.field.displayName));
      return recompute({
        ...state,
        sorts: newSorts,
      });
    }
    case "SET_PREFILTER": {
      return recompute({
        ...state,
        prefilter: action.payload,
      });
    }
    case "SET_PAGE":
      const newPage = getNewPage(action.payload, filteredAndSorted.length);
      return {
        ...state,
        filteredSortedAndPaginated: paginate(filteredAndSorted, newPage),
        page: newPage,
      };
    default:
      return state;
  }
};
