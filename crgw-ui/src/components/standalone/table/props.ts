import { CorganizeFile } from "typedefs/CorganizeFile";

export type ReactTableRow = {
  original: CorganizeFile;
  values: any;
};

export type ReactTableColumn = {
  id: string;
  accessor: string;
  Cell: JSX.Element;
  Header: string;
};

export type ReactTableRenderProps = {
  value: string | number | boolean;
  column: ReactTableColumn;
  row: ReactTableRow;
};

export type ReactTableInstance = {
  page: ReactTableRow[];
  previousPage: () => void;
  nextPage: () => void;
  setGlobalFilter: (s: string) => void;
  gotoPage: (n: number) => void;
  pageCount: number;
  headerGroups: any[];
  getTableProps: () => any;
  getTableBodyProps: () => any;
  prepareRow: (row: ReactTableRow) => void;
  canPreviousPage: () => boolean;
  canNextPage: () => boolean;
  setPageSize: (n: number) => void;
  state: {
    pageIndex: number;
    pageSize: number;
  };
};
