import { Button, List, ListItem } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { getLocalFilenames } from "clients/corganize";

const LocalFileReport = () => {
  const [localFilenames, setLocalFilenames] = useState<string[]>([]);
  const [unregistered, setUnregistered] = useState<string[]>([]);
  const [isProcessing, setProcessing] = useState(false);

  useEffect(() => {
    getLocalFilenames().then(setLocalFilenames);
  }, []);

  const onClick = () => {
    if (isProcessing) {
      // TODO: kill process
      setProcessing(false);
    } else {
      setProcessing(true);
      setUnregistered([]);
      // TODO start the comparison process
    }
  };

  const buttonLabel = isProcessing ? "Cancel" : "Run";

  return (
    <div>
      <div>
        <span>Total local files:</span>
        <span>{localFilenames.length}</span>
      </div>
      <div>
        <span>Unregistered:</span>
        <List>
          {unregistered.map((filename) => (
            <ListItem key={filename}>{filename}</ListItem>
          ))}
        </List>
      </div>
      <Button onClick={onClick}>{buttonLabel}</Button>
    </div>
  );
};

export default LocalFileReport;
