import { useState } from "react";
import { Box, Center, Flex, Heading, Spacer } from "@chakra-ui/react";

import { SessionInfo } from "typedefs/Session";
import { addDays, dateToPosixSeconds } from "utils/dateUtils";
import ExpandableDateRange from "components/reusable/ExpandableDateRange";

import "./LibrarySelector.scss";

const DEFAULT_LOOKBACK_DAYS = 14;
const INCREMENT = 250;

const SessionConfigurer = ({ setInfo }: { setInfo: (s: SessionInfo) => void }) => {
  const [fileLimit, setFileLimit] = useState(500);
  const [endpoint, setEndpoint] = useState<"active" | "stale">("stale");
  const [showLocalOnly, setLocalOnly] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: addDays(new Date(), -DEFAULT_LOOKBACK_DAYS),
    endDate: new Date(),
  });

  const onOK = () =>
    setInfo({
      limit: fileLimit,
      dateRangeStart: dateToPosixSeconds(dateRange.startDate),
      dateRangeEnd: dateToPosixSeconds(dateRange.endDate),
      endpoint,
      showLocalOnly,
    });

  const renderFilecountLimiter = () => (
    <input
      type="number"
      onChange={(e) => setFileLimit(Number.parseInt(e.target.value))}
      value={fileLimit}
      step={INCREMENT}
      min={INCREMENT}
    />
  );

  const maybeRenderDateRangerPicker = () => {
    if (endpoint !== "active") {
      return null;
    }

    return (
      <tr className="date-picker">
        <td>Date Range</td>
        <td>
          <ExpandableDateRange dateRange={dateRange} setDateRange={setDateRange} />
        </td>
      </tr>
    );
  };

  const renderEndpointPicker = () => (
    <select value={endpoint} onChange={(e) => setEndpoint(e.target.value as "stale" | "active")}>
      <option>stale</option>
      <option>active</option>
    </select>
  );

  const renderLocalCheckbox = () => (
    <input type="checkbox" checked={showLocalOnly} onChange={(e) => setLocalOnly(e.target.checked)} />
  );

  const renderConfigTable = () => (
    <div className="config-table">
      <table>
        <tbody>
          <tr className="endpoint-picker">
            <td>Endpoint</td>
            <td>{renderEndpointPicker()}</td>
          </tr>
          {maybeRenderDateRangerPicker()}
          <tr>
            <td>File Limit</td>
            <td>{renderFilecountLimiter()}</td>
          </tr>
          <tr>
            <td>Show Local Files Only</td>
            <td>{renderLocalCheckbox()}</td>
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
