import { Button, Center, SimpleGrid } from "@chakra-ui/react";
import { useCallback } from "react";

import { useGrid } from "providers/grid/hook";
import { EXPOSED_PRESETS } from "providers/grid/presets";

const PresetBar = () => {
  const {
    fieldProps: { setPreset },
  } = useGrid();

  const getOnClick = useCallback(
    (p: (typeof EXPOSED_PRESETS)[0]) => () => setPreset(p),
    [setPreset],
  );

  return (
    <Center className="preset-bar">
      <SimpleGrid spacing=".5em" display="flex">
        {EXPOSED_PRESETS.map((p) => (
          <Button key={p.name} onClick={getOnClick(p)}>
            {p.name}
          </Button>
        ))}
      </SimpleGrid>
    </Center>
  );
};

export default PresetBar;
