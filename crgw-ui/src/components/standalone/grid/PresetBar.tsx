import { Button, Center, SimpleGrid } from "@chakra-ui/react";
import { useEffect } from "react";
import styled from "styled-components";

import {
  fieldDateActivated,
  fieldLastOpened,
  fieldMimetype,
  fieldNew,
  fieldSize,
} from "providers/grid/fields";
import { useGrid } from "providers/grid/hook";
import { Preset } from "providers/grid/types";

const PRESET_DEFAULT: Preset = {
  name: "Default",
  filters: [
    {
      field: fieldNew,
      boolean: {
        value: "checked",
      },
    },
    {
      field: fieldMimetype,
      boolean: {
        value: "checked",
      },
    },
    {
      field: fieldDateActivated,
      boolean: {
        value: "checked",
      },
    },
  ],
  sorts: [
    {
      field: fieldSize,
      direction: "desc",
    },
  ],
};

const PRESET_REVIEW: Preset = {
  name: "Review",
  filters: [
    {
      field: fieldNew,
      boolean: {
        value: "unchecked",
      },
    },
    {
      field: fieldDateActivated,
      boolean: {
        value: "checked",
      },
    },
  ],
  sorts: [
    {
      field: fieldLastOpened,
      direction: "desc",
    },
  ],
};

const ALL_PRESETS: Preset[] = [PRESET_DEFAULT, PRESET_REVIEW];

const PresetBar = () => {
  const {
    fieldProps: { setPreset },
  } = useGrid();

  useEffect(() => {
    setPreset(PRESET_DEFAULT);
  }, []);

  return (
    <StyledPresetBar className="preset-bar">
      <SimpleGrid spacing=".5em" display="flex">
        {ALL_PRESETS.map((p) => (
          <Button key={p.name} onClick={() => setPreset(p)}>
            {p.name}
          </Button>
        ))}
      </SimpleGrid>
    </StyledPresetBar>
  );
};

export default PresetBar;

const StyledPresetBar = styled(Center)`
  margin-bottom: 0.5em;
`;
