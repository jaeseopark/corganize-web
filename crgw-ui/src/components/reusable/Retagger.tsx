import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Button, HStack, IconButton, Input, Select, Table, Tbody, Td, Tr } from "@chakra-ui/react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";
import { useToast } from "providers/toast/hook";

import TagSelector from "./TagSelector";

import { getFilesByTagsWithoutPagination, updateFile } from "clients/corganize";

type TagOperatorWithoutId =
  | { type: "rename"; originalTag: string; value: string }
  | { type: "add" | "remove"; value: string };
type TagOperator = { id: string } & TagOperatorWithoutId;

const DEFAULT_PAYLOAD: { [type: string]: TagOperatorWithoutId } = {
  rename: { type: "rename", originalTag: "", value: "" },
  add: { type: "add", value: "" },
  remove: { type: "remove", value: "" },
};

const OperatorComponent = ({
  operator,
  onUpdate,
  onDelete,
}: {
  operator: TagOperatorWithoutId;
  onUpdate: (updated: TagOperatorWithoutId) => void;
  onDelete: () => void;
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

const toMapper =
  (operator: TagOperator) =>
  (file: CorganizeFile): CorganizeFile => {
    const tagSet = new Set(file.tags!);
    switch (operator.type) {
      case "rename":
        tagSet.delete(operator.originalTag);
        tagSet.add(operator.value);
        break;
      case "add":
        tagSet.add(operator.value);
        break;
      case "remove":
        tagSet.delete(operator.value);
        break;
    }

    return { ...file, tags: Array.from(tagSet) };
  };

const consolidate = (operators: TagOperator[]) => (file: CorganizeFile) =>
  operators.map(toMapper).reduce((f, nextMapper) => {
    const updatedFile = nextMapper(f);
    return updatedFile;
  }, file);

const Retagger = () => {
  const [operators, setOperators] = useState<TagOperator[]>([]);
  const [tag, setTag] = useState("");
  const { enqueueWarning, enqueueSuccess, enqueueAsync } = useToast();
  const { protectHotkey, exposeHotkey } = useBlanket();

  const getFirstInputViolation = () => {
    if (tag.length === 0) {
      return { message: "Tag must be non-empty" };
    }

    if (operators.length === 0) {
      return { message: "At least one operator required" };
    }

    const renameOperators = operators.filter((operator) => operator.type === "rename");
    if (renameOperators.length > 1) {
      return { message: "Only one rename operator allowed" };
    }

    const blankValueInput = operators.find((operator) => !operator.value);
    if (blankValueInput) {
      return { message: "Operator values must be non-empty" };
    }
  };

  const run = () => {
    const violation = getFirstInputViolation();
    if (violation) {
      enqueueWarning(violation);
      return;
    }

    operators.forEach((operator) => {
      if (operator.type === "rename") {
        operator.originalTag = tag.trim();
      }
    });

    const consolidatedOperator = consolidate(operators);

    enqueueAsync({ message: "Loading files..." })
      .then(() => getFilesByTagsWithoutPagination([tag.trim()]))
      .then((files) => {
        enqueueSuccess({ message: `${files.length} Files loaded; applying operators...` });
        return files.map(consolidatedOperator);
      })
      .then((mappedFiles) =>
        Promise.all(mappedFiles.map((file) => updateFile({ fileid: file.fileid, tags: file.tags })))
      )
      .then(() => enqueueSuccess({ message: "Done" }));
  };

  const substitute = (id: string, operator: TagOperatorWithoutId): TagOperator[] =>
    operators.reduce((acc, next) => {
      if (next.id === id) {
        acc.push({ id, ...operator });
      } else {
        acc.push(next);
      }
      return acc;
    }, [] as TagOperator[]);

  const reset = () => {
    setOperators([]);
    setTag("");
  };

  return (
    <Table>
      <Tbody>
        <Tr>
          <Td colSpan={2}>
            <TagSelector
              selectedTags={tag ? [tag] : []}
              onTagsChange={(tags) => setTag(tags[0] || "")}
              maxSelection={1}
            />
          </Td>
          <Td>
            <IconButton
              variant="outline"
              icon={<AddIcon />}
              aria-label="Add a row"
              onClick={() =>
                setOperators([
                  ...operators,
                  { id: uuidv4(), type: "rename", originalTag: "", value: "" },
                ])
              }
            />
          </Td>
        </Tr>
        {operators.map((operator) => (
          <Tr key={operator.id}>
            <OperatorComponent
              operator={operator}
              onUpdate={(updated) => setOperators(substitute(operator.id, updated))}
              onDelete={() => setOperators(operators.filter((o) => o.id !== operator.id))}
            />
          </Tr>
        ))}
        <Tr>
          <Td width="150px">
            <HStack>
              <Button colorScheme="green" onClick={run}>
                Run
              </Button>
              <Button onClick={reset}>Reset</Button>
            </HStack>
          </Td>
          <Td width="250px" />
        </Tr>
      </Tbody>
    </Table>
  );
};

export default Retagger;
