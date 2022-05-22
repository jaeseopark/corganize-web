import { CorganizeFile } from "typedefs/CorganizeFile";

import { Filter, MaybeBoolean } from "providers/grid/types";

const filterGlobalText = (value: string) => (f: CorganizeFile) => {
  const lowered = value.toLowerCase().trim();
  return f.filename.toLowerCase().includes(lowered) || f.fileid.toLowerCase().includes(lowered);
};

export const applyPrefilter = (files: CorganizeFile[], filters: Filter[], prefilter: string) => {
  const prefilteredFiles = files.filter(filterGlobalText(prefilter));
  const newFilters = filters.map((filter) => {
    if (filter.field.filterType === "dropdown") {
      const { dropdown, ...rest } = filter;
      const options = Array.from(
        new Set([
          "(All)",
          ...prefilteredFiles.map((file) => {
            const fieldValue = file[filter.field.key];
            return fieldValue ? String(fieldValue) : "(Blank)";
          }),
        ])
      ).sort();

      const getValue = () => {
        const { value } = dropdown!;
        if (!value) return "(Blank)";
        return options.includes(value) ? value : "(All)";
      };

      return {
        ...rest,
        dropdown: {
          options,
          value: getValue(),
        },
      } as Filter;
    }
    return filter;
  });

  return {
    prefilteredFiles,
    newFilters,
  };
};

export const createMegaFilter = (filters: Filter[]) =>
  filters.reduce(
    (acc, next) => {
      if (next.field!.filterType === "boolean" && next.boolean!.value !== "maybe") {
        return (f: CorganizeFile) => {
          const fieldValue: MaybeBoolean = Boolean(f[next.field.key]) ? "checked" : "unchecked";
          return acc(f) && fieldValue === next.boolean!.value;
        };
      }

      if (next.field!.filterType === "dropdown") {
        const value = next.dropdown!.value;
        if (value === "(All)") {
          return acc;
        } else if (value === "(Blank)") {
          return (f: CorganizeFile) => acc(f) && !f[next.field.key];
        } else {
          return (f: CorganizeFile) => {
            const fieldValue = f[next.field.key];
            return acc(f) && fieldValue === value;
          };
        }
      }

      return acc;
    },
    (f: CorganizeFile) => true
  );
