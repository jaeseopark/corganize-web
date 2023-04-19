import { useEffect, useState } from "react";

import { getIncompleteFileCount } from "clients/corganize";

const RemoteFileReport = () => {
  const [incompleteFileCount, setIncompleteFileCount] = useState<any>();

  useEffect(() => {
    getIncompleteFileCount().then(setIncompleteFileCount);
  }, []);

  if (!incompleteFileCount) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <span>Incomplete file count: </span>
      <span>
        {incompleteFileCount.count}
        {incompleteFileCount.isExhausted && "+"}
      </span>
    </div>
  );
};

export default RemoteFileReport;
