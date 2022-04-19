import cls from "classnames";
import {
  toHumanFileSize,
  toRelativeHumanTime,
} from "utils/numberUtils";
import FileSummary from "components/reusable/FileSummary";
import WithFileContextMenu from "components/reusable/WithFileContextMenu";
import { ReactTableRenderProps } from "components/standalone/table/props";

const TableCellView = ({ value, column, row }: ReactTableRenderProps) => {
  switch (column.id || column.accessor) {
    case "lastupdated":
      return toRelativeHumanTime(value as number);
    case "size": {
      if (!value) return "-";
      return toHumanFileSize(value as number);
    }
    case "filename":
      const { fileid } = row.original;
      return (
        <WithFileContextMenu fileid={row.original.fileid}>
          <FileSummary fileid={fileid} />
        </WithFileContextMenu>
      );
    case "mimetype": {
      const mtClsName = ((value as string) || "").replace("/", "-");
      const clsnames = cls("icon", "mimetype", mtClsName);
      return <div className={clsnames} />;
    }
    case "storageservice": {
      const clsnames = cls("icon", "storageservice", value);
      return <div className={clsnames} />;
    }
    case "isnewfile":
      return <div className={`${String(value)} icon`} />;
    default:
      return value || null;
  }
};

export default TableCellView;
