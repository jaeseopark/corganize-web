import { Badge, Checkbox } from "@chakra-ui/react";
import { useGrid } from "hooks/useGrid";
import { Filter } from "providers/grid/types";

const FilterBadge = ({ filter }: { filter: Filter }) => {
  const { upsertFilter } = useGrid();

  const renderControl = () => {
    if (filter.type === "boolean") {
      return (
        <Checkbox
          isChecked={filter.value === "checked"}
          isIndeterminate={filter.value === "maybe"}
          onChange={() => {
            const nextValue =
              filter.value === "maybe"
                ? "checked"
                : filter.value === "checked"
                ? "unchecked"
                : "checked";
            upsertFilter({
              ...filter,
              value: nextValue,
            });
          }}
        />
      );
    }
    return <label>coming soon</label>;
  };

  return (
    <Badge>
      {filter.name}
      {renderControl()}
    </Badge>
  );
};

export default FilterBadge;
