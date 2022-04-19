import React from "react";

const BLANK = "(Blank)";

function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set([BLANK]);
    preFilteredRows.forEach((row) => {
      options.add(row.values[id] || BLANK);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <select
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default SelectColumnFilter;

export const nullableSelectColumnFilter = (rows, id, filterValue) => {
  if (id.length > 1) {
    throw new Error("Not implemented");
  }

  return rows.filter((row) => {
    const rowValue = row.values[id[0]];
    return (filterValue === BLANK && !rowValue) || filterValue === rowValue;
  });
};
