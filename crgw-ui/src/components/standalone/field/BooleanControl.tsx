import { Checkbox } from "@chakra-ui/react";

import { useGrid } from "providers/grid/hook";
import { Filter, MaybeBoolean } from "providers/grid/types";

const ROTATION: MaybeBoolean[] = ["checked", "maybe", "unchecked"];
const getNextValue = (value: MaybeBoolean) => ROTATION[(ROTATION.indexOf(value) + 1) % 3];

const BooleanControl = ({ filter }: { filter: Filter }) => {
  const {
    fieldProps: { upsertFilter },
  } = useGrid();
  const { boolean } = filter;

  return (
    <Checkbox
      tabIndex={-1}
      isChecked={boolean!.value === "checked"}
      isIndeterminate={boolean!.value === "maybe"}
      onChange={() => {
        const value = getNextValue(boolean!.value as MaybeBoolean);
        upsertFilter({ ...filter, boolean: { value } } as Filter);
      }}
    />
  );
};

export default BooleanControl;
