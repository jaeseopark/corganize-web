import TableHeader from "components/standalone/table/TableHeader";

const TableHeaderGroup = ({ headerGroup }) => {
  const props = headerGroup.getHeaderGroupProps();
  return (
    <tr key={props.name} {...props}>
      {headerGroup.headers.map((column) => {
        return <TableHeader key={column.id} column={column} />;
      })}
    </tr>
  );
};

export default TableHeaderGroup;
