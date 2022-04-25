import { useDispatch, useSelector } from "react-redux";
import {
  removeFilters,
  removeSorts,
  upsertFilters,
  upsertSorts,
  setPrefilter as setPrefilterrrr,
  setPage as setPageeee,
  setFiles as setFilesss,
} from "redux/grid/reducer";
import { Field, Filter, GridState, Sort } from "redux/grid/types";
import { AppDispatch, RootState } from "redux/store";
import { CorganizeFile } from "typedefs/CorganizeFile";

const getPageProps = (state: GridState, dispatch: AppDispatch) => {
  const { page } = state;
  const { normalizedIndex: index, maxIndex } = page;

  const setPage = (newIndex: number) => {
    if (newIndex < 0 || newIndex > maxIndex) {
      return;
    }

    const newPage = {
      ...page,
      index: newIndex,
    };
    dispatch(setPageeee(newPage));
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

const getFileProps = (state: GridState, dispatch: AppDispatch) => {
  const { filteredAndSorted, filteredSortedAndPaginated } = state;

  const setFiles = (files: CorganizeFile[]) => dispatch(setFilesss(files));

  return {
    files: filteredSortedAndPaginated,
    fileCount: filteredAndSorted.length,
    setFiles,
  };
};

const getFieldProps = (state: GridState, dispatch: AppDispatch) => {
  const { prefilter, fields, filters, sorts } = state;

  const getFilter = (field: Field) =>
    filters.find((flt) => flt.field.displayName === field.displayName);

  const getSort = (field: Field) =>
    sorts.find((flt) => flt.field.displayName === field.displayName);

  const setPrefilter = (value: string) => dispatch(setPrefilterrrr(value));

  const upsertFilter = (filter: Filter) => dispatch(upsertFilters([filter]));
  const removeFilter = (filter: Filter) => dispatch(removeFilters([filter]));
  const upsertSort = (sort: Sort) => dispatch(upsertSorts([sort]));
  const removeSort = (sort: Sort) => dispatch(removeSorts([sort]));

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
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.grid);
  return {
    fileProps: getFileProps(state, dispatch),
    fieldProps: getFieldProps(state, dispatch),
    pageProps: getPageProps(state, dispatch),
  };
};
