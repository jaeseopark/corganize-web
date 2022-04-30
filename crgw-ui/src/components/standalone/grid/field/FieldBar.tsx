import { Wrap, WrapItem } from "@chakra-ui/react";

import { useGrid } from "providers/grid/hook";

import FieldComponent from "components/standalone/grid/field/FieldComponent";

const FieldBar = () => {
  const {
    fieldProps: { fields },
  } = useGrid();

  return (
    <Wrap className="field-bar" spacing=".5em" justify="center">
      {fields.map((f) => (
        <WrapItem key={f.displayName}>
          <FieldComponent field={f} />
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default FieldBar;
