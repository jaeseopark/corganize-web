export type SessionInfo = {
  endpoint: "stale" | "active";
  dateRangeStart: number;
  dateRangeEnd: number;
  showLocalOnly: boolean;
  limit: number;
};
