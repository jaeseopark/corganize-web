import { IconButton, Input, Select, Td } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import React from "react";

import { useBlanket } from "providers/blanket/hook";

import { DEFAULT_PAYLOAD } from "./constants";
import { TagOperatorWithoutId } from "./types";

interface OperatorComponentProps {
  operator: TagOperatorWithoutId;
  onUpdate: (updated: TagOperatorWithoutId) => void;
  onDelete: () => void;
}

const OperatorComponent: React.FC<OperatorComponentProps> = ({
  operator,
  onUpdate,
  onDelete,
}) => {
  const { protectHotkey, exposeHotkey } = useBlanket();
  return (
    <>
      <Td>
        <Select
          value={operator.type}
          onChange={({ target: { value: type } }) => onUpdate(DEFAULT_PAYLOAD[type])}
        >
          <option value="rename">Rename</option>
          <option value="add">Add</option>
          <option value="remove">Remove</option>
        </Select>
      </Td>
      <Td>
        <Input
          value={operator.value}
          onChange={({ target: { value } }) =>
            onUpdate({ ...operator, value: value.toLowerCase() })
          }
          onFocus={protectHotkey}
          onBlur={exposeHotkey}
        />
      </Td>
      <Td>
        <IconButton
          onClick={onDelete}
          variant="outline"
          colorScheme="red"
          aria-label="Delete row"
          icon={<DeleteIcon />}
        />
      </Td>
    </>
  );
};

export default OperatorComponent;