export type SessionInfo = {
  endpoint: "stale" | "active";
  limit: number;
  minSize: number; // in bytes
};
