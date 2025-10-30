export type DaemonJobProgress = {
  [jobName: string]: {
    started: number;
    finished?: number;
  };
};
