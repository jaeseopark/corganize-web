import { useEffect, useRef } from "react";

import { useDaemonJobs } from "providers/daemonJobs/hook";
import { useToast } from "providers/toast/hook";

const DaemonJobNotifier = () => {
  const { activeJobs } = useDaemonJobs();
  const { enqueue } = useToast();
  const previousActiveJobs = useRef<string[]>([]);

  useEffect(() => {
    const currentActiveJobNames = activeJobs.map(([name]) => name);
    const previousActiveJobNames = previousActiveJobs.current;

    // Find jobs that started (in current but not in previous)
    const startedJobs = currentActiveJobNames.filter(
      (name) => !previousActiveJobNames.includes(name)
    );

    // Find jobs that finished (in previous but not in current)
    const finishedJobs = previousActiveJobNames.filter(
      (name) => !currentActiveJobNames.includes(name)
    );

    // Show toasts for started jobs
    startedJobs.forEach((jobName) => {
      enqueue({
        header: "Daemon Job Started",
        message: `${jobName} has started running`,
      });
    });

    // Show toasts for finished jobs
    finishedJobs.forEach((jobName) => {
      enqueue({
        header: "Daemon Job Completed",
        message: `${jobName} has finished`,
      });
    });

    // Update the ref with current active jobs
    previousActiveJobs.current = currentActiveJobNames;
  }, [activeJobs, enqueue]);

  return null; // This component doesn't render anything
};

export default DaemonJobNotifier;