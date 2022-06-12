import { FileEndpoint } from "clients/corganize";

export type SessionInfo = {
  endpoint: FileEndpoint;
  limit: number;
  minSize: number; // in bytes
};
