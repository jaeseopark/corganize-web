import { useMemo } from "react";
import cls from "classnames";
import styled from "styled-components";
import { ReactTableRow } from "./props";
import { CorganizeFile } from "../../../typedefs/CorganizeFile";
import { useFileRepository } from "../../../providers/FileRepository";
import FileActions from "./FileActions";

export const ROW_HEIGHT = 45;

const TrComponent = styled.tr`
  height: ${ROW_HEIGHT}px;
`;

const getRenderComponent = (
  row: ReactTableRow,
  cell: any,
  index: number,
  openFile: (file: CorganizeFile) => void
) => {
  if (cell.column.id === "local")
    return (
      <FileActions
        file={row.original}
        openFile={() => openFile(row.original)}
      />
    );

  return cell.render("Cell");
};

type TableRowProps = {
  index: number;
  row: ReactTableRow;
  prepareRow: (row: ReactTableRow) => void;
  openFile: (file: CorganizeFile) => void;
};

const TableRow = ({ index, row, prepareRow, openFile }: TableRowProps) => {
  const { mostRecentFileid } = useFileRepository();

  useMemo(() => prepareRow(row), [prepareRow, row]);

  const trCls = cls({
    "is-most-recent": mostRecentFileid === row.original.fileid,
  });

  return (
    // @ts-ignore
    <TrComponent {...row.getRowProps()} className={trCls}>
      {
        // @ts-ignore
        row.cells.map((cell) => {
          const columnId = cell?.column?.id;
          return (
            <td key={columnId} {...cell.getCellProps()} className={columnId}>
              {getRenderComponent(row, cell, index, openFile)}
            </td>
          );
        })
      }
    </TrComponent>
  );
};

export default TableRow;
