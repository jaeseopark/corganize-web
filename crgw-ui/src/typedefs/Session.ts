export type FileEndpoint = "stale" | "active" | "recent";

export type SessionInfo = {
  endpoint: FileEndpoint;
  limit: number;
  minSize: number; // in bytes
};
