import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useGrid } from "providers/grid/hook";
import { ChangeEvent } from "react";

const GlobalSearch = () => {
  const {
    fieldProps: { prefilter, setPrefilter },
    fileProps: { fileCount },
  } = useGrid();

  const onKeyDown = (e: any) => {
    if (e.key === "Escape") {
      setPrefilter("");
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrefilter(e.target.value as string);
  };

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
      <Input
        placeholder="Filter by keyword"
        value={prefilter}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <label>{fileCount}</label>
    </InputGroup>
  );
};

export default GlobalSearch;
