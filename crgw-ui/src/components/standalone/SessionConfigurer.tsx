import { CheckCircleIcon } from "@chakra-ui/icons";
import { Button, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import ReactTags, { Tag } from "react-tag-autocomplete";

import { FileEndpoint, SessionInfo } from "typedefs/Session";

import { useBlanket } from "providers/blanket/hook";

import { getGlobalTags } from "clients/corganize";

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
  const [suggestions, setSuggestions] = useState([] as Tag[]);
  const { protectHotkey, exposeHotkey } = useBlanket();

  useEffect(() => {
    getGlobalTags().then((tags) => setSuggestions(tags.map((tag) => ({ id: tag, name: tag }))));
  }, []);

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
      <option>bookmarked</option>
    </select>
  );

  const renderTagInput = () => (
    <ReactTags
      delimiters={["Enter", "Tab", ","]}
      tags={tag ? [{ id: tag, name: tag }] : []}
      suggestions={suggestions}
      suggestionsFilter={(a, b) => tag.length === 0 && a.name.startsWith(b.toLowerCase())}
      onAddition={({ name: value }) => setTag(value)}
      onDelete={() => setTag("")}
      onFocus={protectHotkey}
      onBlur={exposeHotkey}
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
    <VStack className="session-configurer">
      {renderConfigTable()}
      <Button
        leftIcon={<CheckCircleIcon />}
        onClick={onOK}
        colorScheme="teal"
        variant="solid"
        aria-label="Start Session"
      >
        {buttonLabel}
      </Button>
    </VStack>
  );
};

export default SessionConfigurer;
