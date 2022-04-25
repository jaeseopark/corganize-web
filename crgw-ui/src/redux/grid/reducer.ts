import { createSlice } from "@reduxjs/toolkit";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { createMegaFilter } from "./filter";
import { createMegaComparer } from "./sort";
import { FieldReferer, Page, Sort, GridState, Filter } from "./types";
import { initialState } from "./init";

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

const repaginate = (state: GridState) => {
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

  const { page, filteredAndSorted } = state;
  state.page = getNewPage(page, filteredAndSorted.length);
  const offset = state.page.normalizedIndex * state.page.itemsPerPage;
  state.filteredSortedAndPaginated = filteredAndSorted!.slice(
    offset,
    offset + state.page.itemsPerPage
  );
};

const resort = (state: GridState) => {
  const { filteredAndSorted, sorts } = state;
  state.filteredAndSorted = filteredAndSorted.sort(createMegaComparer(sorts));
  repaginate(state);
};

const refilter = (state: GridState) => {
  const { files, filters, prefilter } = state;
  state.filteredAndSorted = files.filter(createMegaFilter(filters, prefilter));
  resort(state);
};

const slice = createSlice({
  name: "grid",
  initialState,
  reducers: {
    setFiles: (state, { payload: files }: { payload: CorganizeFile[] }) => {
      state.files = files;
      refilter(state);
    },
    upsertFilters: (state, { payload: newFilters }: { payload: Filter[] }) => {
      const mergedFilters = merge(state.filters, newFilters);
      state.filters = mergedFilters;
      refilter(state);
    },
    removeFilters: (state, { payload: filtersToRemove }: { payload: Filter[] }) => {
      const fieldNamesToRemove = new Set(filtersToRemove.map((flt) => flt.field.displayName));
      state.filters = state.filters.filter((f) => !fieldNamesToRemove.has(f.field.displayName));
      refilter(state);
    },
    upsertSorts: (state, { payload: newSorts }: { payload: Sort[] }) => {
      const mergedSorts = merge(state.sorts, newSorts);
      state.filters = mergedSorts;
      resort(state);
    },
    removeSorts: (state, { payload: sortsToRemove }: { payload: Sort[] }) => {
      const fieldNamesToRemove = new Set(sortsToRemove.map((s) => s.field.displayName));
      state.sorts = state.sorts.filter((s) => !fieldNamesToRemove.has(s.field.displayName));
      resort(state);
    },
    setPrefilter: (state, { payload: newPrefilter }: { payload: string }) => {
      state.prefilter = newPrefilter;
      refilter(state);
    },
    setPage: (state, { payload: newPage }: { payload: Page }) => {
      state.page = newPage;
      resort(state);
    },
  },
});

export const {
  setFiles,
  upsertFilters,
  removeFilters,
  upsertSorts,
  removeSorts,
  setPrefilter,
  setPage,
} = slice.actions;

const gridReducer = slice.reducer;

export default gridReducer;
