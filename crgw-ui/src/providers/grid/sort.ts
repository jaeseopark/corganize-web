import { CorganizeFile } from "typedefs/CorganizeFile";
import { SortOrder } from "./types";

const DEFAULT_COMPARER = (a: CorganizeFile, b: CorganizeFile): number => a.fileid > b.fileid ? 1 : -1;

const getFieldValue = (f: CorganizeFile, s: SortOrder) => {
    if (s.type === "number") {
        return Number(f[s.fieldName]) || 0;
    }

    throw new Error("Unsupported");
}

const getComparer = (sortOrder: SortOrder) => (a: CorganizeFile, b: CorganizeFile): number => {
    const valueA = getFieldValue(a, sortOrder);
    const valueB = getFieldValue(b, sortOrder);
    if (valueA === valueB) return 0;
    if (valueA > valueB) return 1;
    return -1;
}

const getNumericDirection = (s: SortOrder) => s.direction === "asc" ? 1 : -1;

export const createMegaComparer = (sortOrders: SortOrder[]) => {
    if (sortOrders.length === 0) {
        return DEFAULT_COMPARER
    }

    return (a: CorganizeFile, b: CorganizeFile): number =>
        sortOrders.reduce((acc, next) => {
            if (acc !== 0) {
                // comparison is already done in a previous step
                return acc;
            }

            const nextComparer = getComparer(next);
            return nextComparer(a, b) * getNumericDirection(next);
        },
            0);
}