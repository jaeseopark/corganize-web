import { CorganizeFile } from "typedefs/CorganizeFile";
import { Filter, MaybeBoolean } from "./types";

const filterGlobalText = (value: string) => (f: CorganizeFile) => {
  const lowered = value.toLowerCase().trim();
  return f.filename.toLowerCase().includes(lowered) || f.fileid.toLowerCase().includes(lowered);
};

export const createMegaFilter = (filters: Filter[], prefilter: string) =>
  filters.reduce(
    (acc, next) => {
      if (next.field!.filterType === "boolean" && next.boolean!.value !== "maybe") {
        return (f: CorganizeFile) => {
          const fieldValue: MaybeBoolean = Boolean(f[next.field.key])
            ? "checked"
            : "unchecked";
          return acc(f) && fieldValue === next.boolean!.value;
        };
      }

      return acc;
    },
    (f: CorganizeFile) => filterGlobalText(prefilter)(f)
  );