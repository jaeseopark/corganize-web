export type TagOperatorWithoutId =
  | { type: "rename"; originalTag: string; value: string }
  | { type: "add" | "remove"; value: string };

export type TagOperator = { id: string } & TagOperatorWithoutId;