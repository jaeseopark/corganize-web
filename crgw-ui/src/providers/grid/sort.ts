import { CorganizeFile } from "typedefs/CorganizeFile";

import { Field, Sort } from "providers/grid/types";

const DEFAULT_COMPARER = (a: CorganizeFile, b: CorganizeFile): number =>
  a.fileid > b.fileid ? 1 : -1;

const getFieldValue = (file: CorganizeFile, fld: Field) => {
  if (fld.sortType === "number") {
    if (!fld.nestedKey) {
      return Number(file[fld.key]) || 0;
    }
    const obj = file[fld.key] || {};
    return Number((obj as Record<string, number>)[fld.nestedKey]) || 0
  } else if (fld.sortType === "boolean") {
    return Boolean(file[fld.key]) || false;
  } else if (fld.sortType === "string") {
    return String(file[fld.key]) || "";
  }

  throw new Error("Unsupported");
};

const getComparer =
  (sort: Sort) =>
  (a: CorganizeFile, b: CorganizeFile): number => {
    const valueA = getFieldValue(a, sort.field);
    const valueB = getFieldValue(b, sort.field);
    if (valueA === valueB) return 0;
    if (valueA > valueB) return 1;
    return -1;
  };

const getNumericDirection = (s: Sort) => (s.direction === "asc" ? 1 : -1);

export const createMegaComparer = (sorts: Sort[]) => {
  if (sorts.length === 0) {
    return DEFAULT_COMPARER;
  }

  return (a: CorganizeFile, b: CorganizeFile): number =>
    sorts.reduce((acc, next) => {
      if (acc !== 0) {
        // comparison is already done in a previous step
        return acc;
      }

      const nextComparer = getComparer(next);
      return nextComparer(a, b) * getNumericDirection(next);
    }, 0);
};
