import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useGrid } from "hooks/useGrid";
import { ChangeEvent } from "react";

const GlobalSearch = () => {
  const {
    filterProps: { globalSearchFilter: filter, upsertFilter },
    fileProps: { fileCount },
  } = useGrid();

  const onKeyDown = (e: any) => {
    if (e.key === "Escape") {
      upsertFilter({
        ...filter,
        type: "global",
        value: "",
      });
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    upsertFilter({
      ...filter,
      type: "global",
      value: e.target.value as string,
    });
  };

  return (
    <InputGroup>
      <InputLeftElement
        pointerEvents="none"
        children={<SearchIcon color="gray.300" />}
      />
      <Input
        placeholder="Filter by keyword"
        value={filter.value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <label>{fileCount}</label>
    </InputGroup>
  );
};

export default GlobalSearch;
