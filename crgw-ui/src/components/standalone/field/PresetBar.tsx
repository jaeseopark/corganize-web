import { Button, Center, SimpleGrid } from "@chakra-ui/react";

import { useGrid } from "providers/grid/hook";
import { EXPOSED_PRESETS } from "providers/grid/presets";

const PresetBar = () => {
  const {
    fieldProps: { setPreset },
  } = useGrid();

  return (
    <Center className="preset-bar">
      <SimpleGrid spacing=".5em" display="flex">
        {EXPOSED_PRESETS.map((p) => (
          <Button key={p.name} onClick={() => setPreset(p)}>
            {p.name}
          </Button>
        ))}
      </SimpleGrid>
    </Center>
  );
};

export default PresetBar;
