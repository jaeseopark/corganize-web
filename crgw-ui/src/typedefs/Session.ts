import { RetrievalEndpoint } from "clients/corganize";

export type SessionInfo = {
  endpoint: RetrievalEndpoint;
  limit: number;
  minSize: number; // in bytes
};
