import { Dispatch, useContext } from "react";
import { GridContext } from "providers/grid/grid";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { Action, Field, Filter, Sort, State } from "providers/grid/types";

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
  const { filteredAndSorted, filteredSortedAndPaginated } = state;

  const setFiles = (files: CorganizeFile[]) => dispatch({ type: "SET_FILES", payload: files });

  return {
    files: filteredSortedAndPaginated,
    fileCount: filteredAndSorted.length,
    setFiles,
  };
};

const getFieldProps = (state: State, dispatch: Dispatch<Action>) => {
  const { prefilter, fields, filters, sorts } = state;

  const getFilter = (field: Field) =>
    filters.find((flt) => flt.field.displayName === field.displayName);
  const getSort = (field: Field) =>
    sorts.find((flt) => flt.field.displayName === field.displayName);

  const setPrefilter = (value: string) => dispatch({ type: "SET_PREFILTER", payload: value });

  const upsertFilter = (filter: Filter) => dispatch({ type: "UPSERT_FILTERS", payload: [filter] });
  const removeFilter = (filter: Filter) => dispatch({ type: "REMOVE_FILTERS", payload: [filter] });
  const upsertSort = (sort: Sort) => dispatch({ type: "UPSERT_SORTS", payload: [sort] });
  const removeSort = (sort: Sort) => dispatch({ type: "REMOVE_SORTS", payload: [sort] });

  return {
    fields,
    getFilter,
    getSort,
    prefilter,
    setPrefilter,
    upsertFilter,
    removeFilter,
    upsertSort,
    removeSort,
  };
};

export const useGrid = () => {
  const { state, dispatch } = useContext(GridContext);
  return {
    fileProps: getFileProps(state, dispatch!),
    fieldProps: getFieldProps(state, dispatch!),
    pageProps: getPageProps(state, dispatch!),
  };
};
