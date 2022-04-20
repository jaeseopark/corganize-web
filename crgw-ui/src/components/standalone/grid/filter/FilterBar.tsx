import { useEffect } from "react";
import { Tag } from "@chakra-ui/react";
import { useGrid } from "hooks/useGrid";
import { Filter } from "providers/grid/types";
import BooleanControl from "./BooleanControl";

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
  
];

const nonGlobal = (f: Filter) => f.type !== "global";

const renderControl = (f: Filter) => {
  switch (f.type) {
    case "boolean":
      return <BooleanControl filter={f} />;
    default:
      return <label>coming soon</label>;
  }
};

const FilterBar = () => {
  const { filters, upsertFilters } = useGrid();

  useEffect(() => {
    upsertFilters(FILTERS);
  }, []);

  return (
    <div className="filter-bar">
      {filters.filter(nonGlobal).map((f) => (
        <Tag key={f.displayName} size="lg">
          {f.displayName}
          {renderControl(f)}
        </Tag>
      ))}
    </div>
  );
};

export default FilterBar;
