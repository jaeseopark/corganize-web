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
    value: "maybe",
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

const renderControl = (f: Filter) => {
  switch (f.type) {
    case "boolean":
      return <BooleanControl filter={f} />;
    default:
      return null;
  }
};

const FilterBar = () => {
  const {
    filterProps: { filters, upsertFilters, sortOrders },
  } = useGrid();

  useEffect(() => {
    upsertFilters(FILTERS);
  }, []);

  const updateSortOrder = () => {
    // TODO
  };

  const renderSortIcon = (f: Filter) => {};

  return (
    <div className="filter-bar">
      {filters.filter(nonGlobal).map((f) => (
        <Tag key={f.displayName} size="lg">
          <>
            <div className="clickable" onClick={updateSortOrder}>
              <>
                {renderSortIcon(f)}
                <label>{f.displayName}</label>
              </>
            </div>
            {renderControl(f)}
          </>
        </Tag>
      ))}
    </div>
  );
};

export default FilterBar;
