import { useGrid } from "hooks/useGrid";
import { Filter } from "providers/grid/types";
import { useEffect, useState } from "react";
import FilterBadge from "./FilterBadge";

const FILTERS: Filter[] = [
  {
    name: "New",
    type: "boolean",
    fieldName: "isnewfile",
    value: "maybe",
  },
];

const FilterBar = () => {
  const { filters, upsertFilter } = useGrid();
  const [isInitialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      FILTERS.forEach(upsertFilter);
      setInitialized(true);
    }
  }, [isInitialized, setInitialized, upsertFilter]);

  if (!isInitialized) {
    return null;
  }

  return (
    <div>
      {filters.map((f) => (
        <FilterBadge key={f.name} filter={f} />
      ))}
    </div>
  );
};

export default FilterBar;
