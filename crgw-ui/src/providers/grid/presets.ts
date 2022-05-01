import { fieldDateActivated, fieldLastOpened, fieldMimetype, fieldNew, fieldSize } from "./fields";
import { Preset } from "./types";

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

export const ALL_PRESETS: Preset[] = [PRESET_DEFAULT, PRESET_REVIEW];
