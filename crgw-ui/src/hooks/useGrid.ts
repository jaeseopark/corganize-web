import { useContext } from "react";
import { GridContext } from "providers/grid/grid";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { Filter } from "providers/grid/types";

export const useGrid = () => {
  const {
    state: { filteredAndPaginatedFiles, filters },
    dispatch,
  } = useContext(GridContext);

  const upsertFilters = (filters: Filter[]) =>
    dispatch!({ type: "UPSERT_FILTERS", payload: filters });

  const upsertFilter = (filter: Filter) => upsertFilters([filter]);

  const setFiles = (files: CorganizeFile[]) =>
    dispatch!({ type: "SET_FILES", payload: files });

  const [globalSearchFilter] = filters.filter((f) => f.type === "global");

  return {
    files: filteredAndPaginatedFiles,
    filters,
    globalSearchFilter,
    upsertFilter,
    upsertFilters,
    setFiles,
  };
};
