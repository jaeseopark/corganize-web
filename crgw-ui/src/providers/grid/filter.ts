import { CorganizeFile } from "typedefs/CorganizeFile";
import { Filter, MaybeBoolean } from "./types";

const filterGlobalText = (value: string) => {
  const lowered = value.toLowerCase().trim();
  return (f: CorganizeFile) => {
    return (
      f.filename.toLowerCase().includes(lowered) ||
      f.fileid.toLocaleLowerCase().includes(lowered)
    );
  };
};

export const createMegaFilter = (filters: Filter[]) =>
  filters.reduce(
    (acc, next) => {
      if (next.type === "global" && next.value) {
        return (f: CorganizeFile) => acc(f) && filterGlobalText(next.value!)(f);
      }

      if (next.type === "boolean" && next.value !== "maybe") {
        return (f: CorganizeFile) => {
          const fieldValue: MaybeBoolean = Boolean(f[next.fieldName])
            ? "checked"
            : "unchecked";
          return acc(f) && fieldValue === next.value;
        };
      }

      if (next.type === "dropdown" && next.isActive) {
        return (f: CorganizeFile) => {
          const fieldValue = String(f[next.fieldName]);
          return acc(f) && fieldValue === next.value;
        };
      }

      return acc;
    },
    (f: CorganizeFile) => true
  );
