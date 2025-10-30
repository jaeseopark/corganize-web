import { TagOperatorWithoutId } from "./types";

export const DEFAULT_PAYLOAD: { [type: string]: TagOperatorWithoutId } = {
  rename: { type: "rename", originalTag: "", value: "" },
  add: { type: "add", value: "" },
  remove: { type: "remove", value: "" },
};
