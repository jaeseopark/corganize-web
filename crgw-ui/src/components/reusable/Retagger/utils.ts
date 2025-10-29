import { CorganizeFile } from "typedefs/CorganizeFile";

import { TagOperator } from "./types";

export const toMapper =
  (operator: TagOperator) =>
  (file: CorganizeFile): CorganizeFile => {
    const tagSet = new Set(file.tags!);
    switch (operator.type) {
      case "rename":
        tagSet.delete(operator.originalTag);
        tagSet.add(operator.value);
        break;
      case "add":
        tagSet.add(operator.value);
        break;
      case "remove":
        tagSet.delete(operator.value);
        break;
    }

    return { ...file, tags: Array.from(tagSet) };
  };

export const consolidate = (operators: TagOperator[]) => (file: CorganizeFile) =>
  operators.map(toMapper).reduce((f, nextMapper) => {
    const updatedFile = nextMapper(f);
    return updatedFile;
  }, file);