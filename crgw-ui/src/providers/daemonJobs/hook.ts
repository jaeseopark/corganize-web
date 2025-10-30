import { useContext, useEffect } from "react";

import { DaemonJobs } from "./daemonJobs";

export const useDaemonJobs = () => {
  const {
    state: { progress },
  } = useContext(DaemonJobs);

  // Get active jobs (jobs without finished timestamp)
  const activeJobs = Object.entries(progress).filter(([, job]) => !job.finished);

  // Get completed jobs (jobs with finished timestamp)
  const completedJobs = Object.entries(progress).filter(([, job]) => job.finished);

  return {
    progress,
    activeJobs,
    completedJobs,
  };
};
