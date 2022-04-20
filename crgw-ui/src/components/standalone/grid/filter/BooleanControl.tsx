import { Checkbox } from "@chakra-ui/react";
import { useGrid } from "hooks/useGrid";
import { Filter, MaybeBoolean } from "providers/grid/types";

const ROTATION: MaybeBoolean[] = ["checked", "unchecked", "maybe"];
const getNextValue = (value: MaybeBoolean) =>
  ROTATION[(ROTATION.indexOf(value) + 1) % 3];

const BooleanControl = ({ filter }: { filter: Filter }) => {
  const { upsertFilter } = useGrid();
  return (
    <Checkbox
      tabIndex={-1}
      isChecked={filter.value === "checked"}
      isIndeterminate={filter.value === "maybe"}
      onChange={() => {
        const value = getNextValue(filter.value as MaybeBoolean);
        upsertFilter({ ...filter, value });
      }}
    />
  );
};

export default BooleanControl;
