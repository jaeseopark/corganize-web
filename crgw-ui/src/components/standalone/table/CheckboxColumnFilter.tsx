import { useState } from "react";
import Checkbox from "react-three-state-checkbox";
import { ReactTableRow } from "components/standalone/table/props";

type CheckboxState = "true" | "false" | "maybe";

type BooleanValueSelector = (row: ReactTableRow) => boolean;

const CheckboxColumnFilter = ({
  column: { setFilter },
}: {
  column: { setFilter: (c: CheckboxState) => void };
}) => {
  const [value, setValue] = useState<CheckboxState>("maybe");

  const nextCheckboxState = () => {
    switch (value) {
      case "maybe":
        return "true";
      case "true":
        return "false";
      default:
        return "maybe";
    }
  };

  const rotate = () => {
    const newValue = nextCheckboxState();
    setValue(newValue);
    setFilter(newValue);
  };

  return (
    <Checkbox
      className="column-filter checkbox"
      checked={value === "true"}
      indeterminate={value === "maybe"}
      onChange={rotate}
    />
  );
};

const reversibleFilter =
  (isForward = true, selector?: BooleanValueSelector) =>
  (rows: ReactTableRow[], id: string[], filterValue: CheckboxState) => {
    if (id.length > 1) {
      throw new Error("Not implemented");
    }

    return rows.filter((row: ReactTableRow) => {
      if (filterValue === "maybe") return true;

      const rowValue = selector ? selector(row) : !!row.values[id[0]];
      const filterValueAsBoolean = filterValue === "true";
      const match = rowValue === filterValueAsBoolean;
      return isForward === match;
    });
  };

export default CheckboxColumnFilter;

export const checkboxColumnFilter = reversibleFilter();

export const reversedCheckboxColumnFilter = reversibleFilter(false);

export const checkboxColumnFilterWithCustomSelector = (
  selector: BooleanValueSelector
) => reversibleFilter(true, selector);
