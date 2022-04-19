import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFileRepository } from "../../../providers/FileRepository";
import {
  useColumnOrder,
  useFilters,
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";

import TableCellView from "./TableCellView";
import {
  ReactTableRenderProps,
  ReactTableColumn,
  ReactTableInstance,
} from "./props";
import CheckboxColumnFilter, {
  checkboxColumnFilter,
  checkboxColumnFilterWithCustomSelector,
} from "./CheckboxColumnFilter";
import SelectColumnFilter, {
  nullableSelectColumnFilter,
} from "./SelectColumnFilter";
import { CorganizeFile } from "../../../typedefs/CorganizeFile";
import { useBlanket } from "../../../providers/Blanket";
import FileSummary from "../../reusable/FileSummary";
import FileView from "../FileView";
import PageControl from "./PageControl";
import TableRow, { ROW_HEIGHT } from "./TableRow";
import TableHeaderGroup from "./TableHeaderGroup";
import { getTableKeyHandler } from "./tableUtils";
import { useWindowSize } from "react-use";

import "./TableView.scss";

const hiddenColumns = ["sourceurl", "fileid", "encryptedPath"];
const columnOrder = ["dateactivated", "isnewfile"];

const TableView = () => {
  const { files, markAsOpened, searchKeyword } = useFileRepository();
  const { setBlanket, isBlanketEnabled: isBlanketEnalbed } = useBlanket();
  const { toggleFavourite } = useFileRepository();
  const { height } = useWindowSize();
  const tableRef = useRef();

  const data = useMemo(() => files || [], [files]);
  const columns: ReactTableColumn[] = useMemo(() => {
    const hidden = hiddenColumns.map((accessor) => {
      return {
        accessor,
      };
    });

    const custom = [
      {
        accessor: "highlights",
        Header: "highlights",
        Cell: ({ row }: ReactTableRenderProps) => {
          const {
            original: { multimedia },
          } = row;
          return <div className={`${String(!!multimedia?.highlights)} icon`} />;
        },
        Filter: CheckboxColumnFilter,
        filter: checkboxColumnFilterWithCustomSelector((row) => {
          const {
            original: { multimedia },
          } = row;
          return !!multimedia?.highlights;
        }),
      },
      {
        accessor: "lastupdated",
        Header: "modded",
      },
      { accessor: "size" },
      {
        accessor: "storageservice",
        Header: "storage",
        Filter: SelectColumnFilter,
        filter: nullableSelectColumnFilter,
      },
      {
        accessor: "mimetype",
        Filter: SelectColumnFilter,
        filter: nullableSelectColumnFilter,
      },
      { accessor: "filename" },
      {
        id: "local",
        accessor: "local",
        Header: "local",
        Filter: CheckboxColumnFilter,
        filter: checkboxColumnFilterWithCustomSelector(
          (row) => !!row.original.streamingUrl
        ),
      },
      {
        accessor: "dateactivated",
        Header: "fav",
        Cell: ({ value, row }: ReactTableRenderProps) => {
          const onClick = () => {
            const { original: file } = row;
            toggleFavourite(file.fileid);
          };
          return (
            <div onClick={onClick} className={`${String(!!value)} icon`} />
          );
        },
        Filter: CheckboxColumnFilter,
        filter: checkboxColumnFilter,
      },
      {
        accessor: "isnewfile",
        Header: "new",
        Filter: CheckboxColumnFilter,
        filter: checkboxColumnFilter,
      },
    ];

    // @ts-ignore
    return [...hidden, ...custom].map((column: ReactTableColumn) => {
      if (!column.id) {
        column.id = column.accessor;
      }
      if (!column.Header && column.accessor) {
        column.Header = column.accessor;
      }
      if (!column.Cell) {
        // @ts-ignore
        column.Cell = TableCellView;
      }
      return column;
    });
  }, [toggleFavourite]);

  // @ts-ignore
  const tableInstance: ReactTableInstance = useTable(
    {
      // @ts-ignore
      columns,
      data,
      initialState: {
        hiddenColumns,
        // @ts-ignore
        columnOrder,
      },
      autoResetPage: false,
      autoResetSortBy: false,
      autoResetFilters: false,
      autoResetGlobalFilter: false,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useColumnOrder,
    usePagination
  );

  useEffect(
    () => tableInstance.setGlobalFilter(searchKeyword),
    [searchKeyword, tableInstance]
  );

  const focusTable = () => {
    if (tableRef?.current) {
      // @ts-ignore
      tableRef.current.focus();
    }
  };

  useEffect(() => {
    if (!isBlanketEnalbed) {
      focusTable();
    }
  }, [isBlanketEnalbed]);

  useEffect(() => {
    if (tableInstance && height) {
      const effectiveHeight = height - 180;
      const {
        state: { pageIndex },
      } = tableInstance;
      tableInstance.setPageSize(Math.floor(effectiveHeight / ROW_HEIGHT));
      tableInstance.gotoPage(pageIndex);
    }
  }, [height, tableInstance]);

  const openFile = useCallback(
    (file: CorganizeFile): void => {
      if (file.streamingUrl) {
        const { fileid: fid } = file;
        const title = <FileSummary fileid={fid} withFav withSize withStorage />;
        const body = <FileView fileid={fid} />;
        markAsOpened(fid);
        setBlanket(title, body);
      }
    },
    [markAsOpened, setBlanket]
  );

  const onKeyDown = useMemo(
    () => getTableKeyHandler(tableInstance, focusTable, openFile),
    [openFile, tableInstance]
  );

  return (
    <div className="tableview">
      <table
        //@ts-ignore
        ref={tableRef}
        className="table"
        {...tableInstance.getTableProps()}
        onKeyDown={onKeyDown}
        tabIndex="1"
      >
        <thead>
          <TableHeaderGroup headerGroup={tableInstance.headerGroups[0]} />
        </thead>
        <tbody {...tableInstance.getTableBodyProps()}>
          {tableInstance.page.map((row, i) => (
            <TableRow
              key={row.original.fileid}
              index={i}
              row={row}
              prepareRow={tableInstance.prepareRow}
              openFile={openFile}
            />
          ))}
        </tbody>
      </table>
      <PageControl tableInstance={tableInstance} />
    </div>
  );
};
export default TableView;
