import { Box, Center, Flex, Heading } from "@chakra-ui/react";
import { useState } from "react";

import { FileEndpoint, SessionInfo } from "typedefs/Session";

import "./SessionConfigurer.scss";

const FILE_COUNT_INCREMENT = 500;
const DEFAULT_FILE_COUNT_LIMIT = 1000;
const MIN_FILE_SIZE_INCREMENT = 50;
const MB_TO_BYTES = 1000000;

const SessionConfigurer = ({ setInfo }: { setInfo: (s: SessionInfo) => void }) => {
  const [fileCountLimit, setFileCountLimit] = useState(DEFAULT_FILE_COUNT_LIMIT);
  const [minFileSize, setMinFileSize] = useState(0);
  const [endpoint, setEndpoint] = useState<FileEndpoint>("stale");
  const [tag, setTag] = useState("");

  const onOK = () =>
    setInfo({
      limit: fileCountLimit,
      minSize: minFileSize * MB_TO_BYTES,
      endpoint,
      tag,
    });

  const renderFileCountLimiter = () => (
    <input
      type="number"
      onChange={(e) => setFileCountLimit(Number.parseInt(e.target.value))}
      value={fileCountLimit}
      step={FILE_COUNT_INCREMENT}
      min={FILE_COUNT_INCREMENT}
      disabled={!!tag}
    />
  );

  const renderFileSizeLimiter = () => (
    <input
      type="number"
      onChange={(e) => setMinFileSize(Number.parseInt(e.target.value))}
      value={minFileSize}
      step={MIN_FILE_SIZE_INCREMENT}
      min={0}
      disabled={!!tag}
    />
  );

  const renderEndpointPicker = () => (
    <select
      value={endpoint}
      onChange={(e) => setEndpoint(e.target.value as FileEndpoint)}
      disabled={!!tag}
    >
      <option>stale</option>
      <option>active</option>
      <option>recent</option>
      <option>dense</option>
    </select>
  );

  const renderTagInput = () => (
    <input
      type="text"
      defaultValue={tag}
      onChange={(e) => setTag(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOK();
      }}
    />
  );

  const renderConfigTable = () => (
    <div className="config-table">
      <table>
        <tbody>
          <tr className="endpoint-picker">
            <td>Endpoint</td>
            <td>{renderEndpointPicker()}</td>
          </tr>
          <tr>
            <td>File Count Limit</td>
            <td>{renderFileCountLimiter()}</td>
          </tr>
          <tr>
            <td>Min File Size (MB)</td>
            <td>{renderFileSizeLimiter()}</td>
          </tr>
          <tr>
            <td>Tag</td>
            <td>{renderTagInput()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  let buttonLabel = "Start a Session";
  if (tag) {
    buttonLabel += " (w/ tag)";
  }

  return (
    <Flex className="session-configurer" direction="column">
      {renderConfigTable()}
      <Box>
        <Center className="button clickable" onClick={onOK}>
          <Heading size="md">{buttonLabel}</Heading>
        </Center>
      </Box>
    </Flex>
  );
};

export default SessionConfigurer;
