export type FileEndpoint = "stale" | "active" | "recent" | "dense";

export type SessionInfo = {
  endpoint: FileEndpoint;
  limit: number;
  minSize: number; // in bytes
};
