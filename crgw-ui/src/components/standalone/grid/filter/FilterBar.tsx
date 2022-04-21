import { useEffect } from "react";

import { useGrid } from "hooks/useGrid";
import { Filter, SortOrder } from "providers/grid/types";
import FilterTag from "./FilterTag";

const DEFAULT_FILTERS: Filter[] = [
  {
    displayName: "New",
    type: "boolean",
    fieldName: "isnewfile",
    value: "checked",
  },
  {
    displayName: "Local",
    type: "boolean",
    fieldName: "streamingurl",
    value: "checked",
  },
  {
    displayName: "Mimetype",
    type: "boolean", // TODO: change this to dropdown
    fieldName: "mimetype",
    value: "checked",
  },
  {
    displayName: "Size",
    type: "number",
    fieldName: "size",
    value1: 0,
    value2: 1,
    isActive: false,
  },
];

const DEFAULT_SORT_ORDER: SortOrder = {
  displayName: "Size",
  type: "number",
  fieldName: "size",
  direction: "desc"
};

const nonGlobal = (f: Filter) => f.type !== "global";


const FilterBar = () => {
  const {
    filterProps: { filters, upsertFilters, setSortOrder },
  } = useGrid();

  useEffect(() => {
    upsertFilters(DEFAULT_FILTERS);
    setSortOrder(DEFAULT_SORT_ORDER)
  }, []);


  return (
    <div className="filter-bar">
      {filters.filter(nonGlobal).map((f) => (
        <FilterTag key={f.displayName} filter={f} />
      ))}
    </div>
  );
};

export default FilterBar;
