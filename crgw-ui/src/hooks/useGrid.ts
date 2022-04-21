import { Dispatch, useContext } from "react";
import { GridContext } from "providers/grid/grid";
import { CorganizeFile } from "typedefs/CorganizeFile";
import {
  Action,
  Filter,
  GlobalSearchFilter,
  SortOrder,
  State,
} from "providers/grid/types";

const getPageProps = (state: State, dispatch: Dispatch<Action>) => {
  const { page } = state;
  const { normalizedIndex: index, maxIndex } = page;

  const setPage = (newIndex: number) => {
    if (newIndex < 0 || newIndex > maxIndex) {
      return;
    }

    dispatch({
      type: "SET_PAGE",
      payload: {
        ...page,
        index: newIndex,
      },
    });
  };

  return {
    index,
    maxIndex,
    canIncrement: index < maxIndex,
    canDecrement: index > 0,
    incrementPage: () => setPage(index + 1),
    decrementPage: () => setPage(index - 1),
  };
};

const getFileProps = (state: State, dispatch: Dispatch<Action>) => {
  const { filteredAndSorted: filteredFiles, filteredSortedAndPaginated: filteredAndPaginatedFiles } = state;

  const setFiles = (files: CorganizeFile[]) =>
    dispatch({ type: "SET_FILES", payload: files });

  return {
    files: filteredAndPaginatedFiles,
    fileCount: filteredFiles.length,
    setFiles,
  };
};

const getFilterProps = (state: State, dispatch: Dispatch<Action>) => {
  const { filters, sortOrders } = state;
  const [globalSearchFilter] = filters.filter((f) => f.type === "global");

  const upsertFilters = (filters: Filter[]) =>
    dispatch({ type: "UPSERT_FILTERS", payload: filters });

  const upsertFilter = (filter: Filter) => upsertFilters([filter]);

  const setSortOrder = (sortOrder: SortOrder) => dispatch({ type: "SET_SORT_ORDERS", payload: [sortOrder] })

  const clearSortOrder = () => dispatch({ type: "SET_SORT_ORDERS", payload: [] })

  const getSortOrderByFilter = (filter: Filter) => sortOrders.find(so => so.filter.displayName === filter.displayName);

  return {
    filters,
    upsertFilter,
    upsertFilters,
    setSortOrder,
    clearSortOrder,
    getSortOrderByFilter,
    globalSearchFilter: globalSearchFilter as GlobalSearchFilter,
  };
};

export const useGrid = () => {
  const { state, dispatch } = useContext(GridContext);
  return {
    fileProps: getFileProps(state, dispatch!),
    filterProps: getFilterProps(state, dispatch!),
    pageProps: getPageProps(state, dispatch!),
  };
};
