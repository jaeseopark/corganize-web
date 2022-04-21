import { useEffect } from "react";

import { useGrid } from "hooks/useGrid";
import { Filter } from "providers/grid/types";
import FilterTag from "./FilterTag";

const FILTERS: Filter[] = [
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

const nonGlobal = (f: Filter) => f.type !== "global";


const FilterBar = () => {
  const {
    filterProps: { filters, upsertFilters },
  } = useGrid();

  useEffect(() => {
    upsertFilters(FILTERS);
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
