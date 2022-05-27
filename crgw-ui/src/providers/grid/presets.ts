import {
  fieldDateActivated,
  fieldLastOpened,
  fieldMimetype,
  fieldNew,
  fieldSize,
} from "providers/grid/fields";
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
      dropdown: {
        value: "(All)",
        options: [],
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
      direction: "asc",
    },
  ],
};

export const ALL_PRESETS: Preset[] = [PRESET_DEFAULT, PRESET_REVIEW];
