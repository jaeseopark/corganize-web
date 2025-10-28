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

const PRESET_BOOKMARKED: Preset = {
  name: "Bookmarked",
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
    {
      field: Fields.fieldBookmark,
      boolean: {
        value: "checked",
      },
    },
  ],
  sorts: [
    {
      field: Fields.fieldLastOpened,
      direction: "asc",
    },
  ],
};

export const EXPOSED_PRESETS: Preset[] = [PRESET_DEFAULT, PRESET_REVIEW, PRESET_BOOKMARKED];
