import { CorganizeFile } from "typedefs/CorganizeFile";
import { ReactTableInstance } from "components/standalone/table/props";
import { randomIntFromInterval } from "utils/numberUtils";
import { sampleOne } from "utils/arrayUtils";

export const goToRandomPage = (tableInstance: ReactTableInstance) =>
  tableInstance.gotoPage(randomIntFromInterval(1, tableInstance.pageCount) - 1);

export function getTableKeyHandler(
  tableInstance: ReactTableInstance,
  focusTable: () => void,
  downloadOrOpenFile: (file: CorganizeFile) => void
) {
  const downloadAllRemoteFiles = () => {
    tableInstance.page
      .map((row) => row.original)
      .filter((file: CorganizeFile) => !file.streamingUrl && file.storageservice)
      .forEach((file: CorganizeFile) => {
        downloadOrOpenFile(file);
      });
  };

  const downloadOrOpenFileByIndex = (visibleIndex: number) => {
    if (tableInstance.page.length > visibleIndex)
      downloadOrOpenFile(tableInstance.page[visibleIndex].original);
  };

  const openFirstNewFile = () =>
    downloadOrOpenFile(
      tableInstance.page
        .map((row) => row.original)
        .find((file) => file.streamingUrl && file.isnewfile) as CorganizeFile
    );

  const openRandomLocalFile = () => {
    const files = tableInstance.page
      .map((row) => row.original)
      .filter((f) => f.streamingUrl);
    downloadOrOpenFile(sampleOne(files));
  };

  // @ts-ignore
  return (event) => {
    const key = event.key.toLowerCase();
    if (key >= "0" && key <= "9") {
      downloadOrOpenFileByIndex(parseInt(key));
    } else if (key === "`") {
      openFirstNewFile();
    } else if (key === "arrowright" || key === " ") {
      tableInstance.nextPage();
      focusTable();
    } else if (key === "arrowleft") {
      tableInstance.previousPage();
      focusTable();
    } else if (key === "r") {
      goToRandomPage(tableInstance);
      focusTable();
    } else if (key === "g") {
      openRandomLocalFile();
    } else if (key === "c") {
      downloadAllRemoteFiles();
    }
  };
}
