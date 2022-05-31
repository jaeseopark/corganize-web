import { Box, Center, Flex, Heading, Spacer } from "@chakra-ui/react";
import { useState } from "react";

import { SessionInfo } from "typedefs/Session";

import "./LibrarySelector.scss";

const FILE_COUNT_INCREMENT = 500;
const MIN_FILE_SIZE_INCREMENT = 50;
const MB_TO_BYTES = 1000000;

const SessionConfigurer = ({ setInfo }: { setInfo: (s: SessionInfo) => void }) => {
  const [fileCountLimit, setFileCountLimit] = useState(FILE_COUNT_INCREMENT);
  const [minFileSize, setMinFileSize] = useState(MIN_FILE_SIZE_INCREMENT);
  const [endpoint, setEndpoint] = useState<"active" | "stale">("stale");

  const onOK = () =>
    setInfo({
      limit: fileCountLimit,
      minSize: minFileSize * MB_TO_BYTES,
      endpoint,
    });

  const renderFileCountLimiter = () => (
    <input
      type="number"
      onChange={(e) => setFileCountLimit(Number.parseInt(e.target.value))}
      value={fileCountLimit}
      step={FILE_COUNT_INCREMENT}
      min={FILE_COUNT_INCREMENT}
    />
  );

  const renderFileSizeLimiter = () => (
    <input
      type="number"
      onChange={(e) => setMinFileSize(Number.parseInt(e.target.value))}
      value={minFileSize}
      step={MIN_FILE_SIZE_INCREMENT}
      min={0}
    />
  );

  const renderEndpointPicker = () => (
    <select value={endpoint} onChange={(e) => setEndpoint(e.target.value as "stale" | "active")}>
      <option>stale</option>
      <option>active</option>
    </select>
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
        </tbody>
      </table>
    </div>
  );

  const render = () => (
    <Flex className="session-configurer" direction="column">
      <Box>
        <Center>
          <Heading>Configure Session</Heading>
        </Center>
      </Box>
      {renderConfigTable()}
      <Spacer />
      <Box>
        <Center className="ok-container clickable" onClick={onOK}>
          <label>OK</label>
        </Center>
      </Box>
    </Flex>
  );

  return <Center h="100vh">{render()}</Center>;
};

export default SessionConfigurer;
