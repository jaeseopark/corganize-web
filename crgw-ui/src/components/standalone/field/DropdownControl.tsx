import { useGrid } from "providers/grid/hook";
import { Filter } from "providers/grid/types";

const DropdownControl = ({ filter }: { filter: Filter }) => {
  const {
    fieldProps: { upsertFilter },
  } = useGrid();
  const { dropdown } = filter;
  const { options, value } = dropdown!;

  return (
    <select
      tabIndex={-1}
      value={value}
      onChange={(e) => {
        const newValue = e.target.value;
        upsertFilter({ ...filter, dropdown: { value: newValue, options } } as Filter);
      }}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
};

export default DropdownControl;
