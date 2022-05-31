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
      field: fieldLastOpened,
      direction: "desc",
    },
  ],
};

export const PRESET_TAG_VIEW: Preset = {
  name: "tag",
  filters: [
    {
      field: fieldNew,
      boolean: {
        value: "maybe",
      },
    },
    {
      field: fieldDateActivated,
      boolean: {
        value: "maybe",
      },
    },
    {
      field: fieldMimetype,
      dropdown: {
        value: "(All)",
        options: [],
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

export const EXPOSED_PRESETS: Preset[] = [PRESET_DEFAULT, PRESET_REVIEW];
