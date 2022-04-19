const maybeRenderSortIcon = (column) => {
  if (!column.isSorted) return null;
  return (
    <span
      key={column.id}
      className={column.isSortedDesc ? "sorted desc" : "sorted asc"}
    />
  );
};

const maybeRenderSecondaryHeader = (column) => {
  if (!column.canFilter || !column.Filter) return null;
  return <div className="secondary-header">{column.render("Filter")}</div>;
};

const TableHeader = ({ column }) => {
  const { onClick, ...columnHeaderProps } = column.getHeaderProps(
    column.getSortByToggleProps()
  );

  const renderPrimaryHeader = () => (
    <div className="primary-header">
      <span role="button" onClick={onClick}>
        {column.render("Header")}
      </span>
      {maybeRenderSortIcon(column)}
    </div>
  );

  return (
    <th
      key={column.id}
      scope="col"
      {...columnHeaderProps}
      className={column.id}
    >
      {renderPrimaryHeader()}
      {maybeRenderSecondaryHeader(column)}
    </th>
  );
};

export default TableHeader;
