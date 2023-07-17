export type FileEndpoint = "stale" | "active" | "recent" | "dense" | "bookmarked";

export type SessionInfo = {
  endpoint: FileEndpoint;
  limit: number;
  minSize: number; // in bytes
  tag: string;
};
