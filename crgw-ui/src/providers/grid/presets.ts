import Fields from "providers/grid/fields";
import { Preset } from "providers/grid/types";

const PRESET_DEFAULT: Preset = {
  name: "Default",
  filters: [
    {
      field: Fields.fieldNew,
      boolean: {
        value: "checked",
      },
    },
    {
      field: Fields.fieldMimetype,
      dropdown: {
        value: "(All)",
        options: [],
      },
    },
    {
      field: Fields.fieldDateActivated,
      boolean: {
        value: "checked",
      },
    },
    {
      field: Fields.fieldTags,
      boolean: {
        value: "maybe",
      },
    },
  ],
  sorts: [
    {
      field: Fields.fieldSize,
      direction: "desc",
    },
  ],
};

const PRESET_REVIEW: Preset = {
  name: "Review",
  filters: [
    {
      field: Fields.fieldNew,
      boolean: {
        value: "unchecked",
      },
    },
    {
      field: Fields.fieldMimetype,
      dropdown: {
        value: "(All)",
        options: [],
      },
    },
    {
      field: Fields.fieldDateActivated,
      boolean: {
        value: "checked",
      },
    },
    {
      field: Fields.fieldTags,
      boolean: {
        value: "maybe",
      },
    },
  ],
  sorts: [
    {
      field: Fields.fieldLastOpened,
      direction: "desc",
    },
  ],
};

export const PRESET_TAG_VIEW: Preset = {
  name: "tag",
  filters: [
    {
      field: Fields.fieldNew,
      boolean: {
        value: "maybe",
      },
    },
    {
      field: Fields.fieldDateActivated,
      boolean: {
        value: "maybe",
      },
    },
    {
      field: Fields.fieldMimetype,
      dropdown: {
        value: "(All)",
        options: [],
      },
    },
  ],
  sorts: [
    {
      field: Fields.fieldLastOpened,
      direction: "desc",
    },
  ],
};

export const EXPOSED_PRESETS: Preset[] = [PRESET_DEFAULT, PRESET_REVIEW];
