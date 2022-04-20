import { useMemo } from "react";
import cls from "classnames";
import styled from "styled-components";
import { ReactTableRow } from "components/standalone/table/props";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { useFileRepository } from "providers/FileRepository";

export const ROW_HEIGHT = 45;

const TrComponent = styled.div`
  height: ${ROW_HEIGHT}px;
`;

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
              {cell.render("Cell")}
            </td>
          );
        })
      }
    </TrComponent>
  );
};

export default TableRow;
