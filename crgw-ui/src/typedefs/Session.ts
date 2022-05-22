export type SessionInfo = {
  endpoint: "stale" | "active";
  showLocalOnly: boolean;
  limit: number;
  minSize: number; // in bytes
};
