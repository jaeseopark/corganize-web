import { useContext } from "react";
import { GridContext } from "providers/grid/grid";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { Filter } from "providers/grid/types";

export const useGrid = () => {
  const {
    state: { filteredAndPaginatedFiles, filters },
    dispatch,
  } = useContext(GridContext);

  const upsertFilter = (filter: Filter) =>
    dispatch!({ type: "UPSERT_FILTER", payload: filter });

  const setFiles = (files: CorganizeFile[]) =>
    dispatch!({ type: "SET_FILES", payload: files });

  return {
    files: filteredAndPaginatedFiles,
    filters,
    upsertFilter,
    setFiles,
  };
};
