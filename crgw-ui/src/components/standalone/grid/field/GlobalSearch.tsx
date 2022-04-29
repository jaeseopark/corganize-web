import { SearchIcon } from "@chakra-ui/icons";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { ChangeEvent } from "react";
import styled from "styled-components";

import { useGrid } from "providers/grid/hook";

const GlobalSearch = () => {
  const {
    fieldProps: { prefilter, setPrefilter },
    fileProps: { fileCount },
  } = useGrid();

  const handleKey = (key: string) => {
    if (key === "escape") {
      setPrefilter("");
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrefilter(e.target.value as string);
  };

  return (
    <InputGroup marginY="1em">
      <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
      <Input
        placeholder="Filter by keyword"
        value={prefilter}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.shiftKey || e.ctrlKey) return;
          handleKey(e.key.toLowerCase());
        }}
      />
      <CounterLabel>{fileCount}</CounterLabel>
    </InputGroup>
  );
};

export default GlobalSearch;

const CounterLabel = styled.label`
  position: absolute;
  right: 0;
  padding: 0.5em;
`;
