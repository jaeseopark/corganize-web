import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  HStack,
  IconButton,
  Progress,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useToast } from "providers/toast/hook";

import { getFilesByTagsWithoutPagination, updateFile } from "clients/corganize";

import TagSelector from "../TagSelector";
import LineGraph, { GraphDataPoint } from "./LineGraph";
import OperatorComponent from "./OperatorComponent";
import { TagOperator, TagOperatorWithoutId } from "./types";
import { consolidate } from "./utils";

const MAX_FILES_TO_PROCESS = 500;

const Retagger: React.FC = () => {
  const [operators, setOperators] = useState<TagOperator[]>([]);
  const [tag, setTag] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressData, setProgressData] = useState<GraphDataPoint[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const { enqueueWarning, enqueueSuccess } = useToast();

  const getFirstInputViolation = useCallback(() => {
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
  }, [tag, operators]);

  const run = useCallback(() => {
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

    setShowProgress(true);
    setIsRunning(true);
    setProgress(0);
    setProgressData([]);

    getFilesByTagsWithoutPagination([tag.trim()])
      .then((files: CorganizeFile[]) => {
        if (files.length === 0) {
          enqueueWarning({ message: "No files found with the specified tag" });
          setIsRunning(false);
          setShowProgress(false);
          return;
        }

        const limitedFiles = files.slice(0, MAX_FILES_TO_PROCESS);
        const total = limitedFiles.length;
        setTotalFiles(total);

        // Warn user if files were truncated
        if (files.length > MAX_FILES_TO_PROCESS) {
          enqueueWarning({
            message: `Found ${files.length} files, but only processing the first ${MAX_FILES_TO_PROCESS} to avoid network throttling.`,
          });
        }

        const mappedFiles = limitedFiles.map(consolidatedOperator);
        let processed = 0;
        const startTime = Date.now();

        const id = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          setProgressData((prev) => [...prev, { timestamp: elapsed, processed }]);
        }, 1000);

        setIntervalId(id);

        const promises = mappedFiles.map(async (file: CorganizeFile) => {
          await updateFile({ fileid: file.fileid, tags: file.tags });
          processed++;
          setProgress((processed / total) * 100);
        });

        return Promise.all(promises).then(() => ({ id, total }));
      })
      .then((result) => {
        if (result) {
          const { id, total } = result;
          if (id) clearInterval(id);
          enqueueSuccess({ message: `Successfully processed ${total} files` });
        }
        setIsRunning(false);
        setShowProgress(false);
      });
  }, [getFirstInputViolation, tag, operators, enqueueWarning]);

  const substitute = useCallback(
    (id: string, operator: TagOperatorWithoutId): TagOperator[] =>
      operators.reduce((acc, next) => {
        if (next.id === id) {
          acc.push({ id, ...operator });
        } else {
          acc.push(next);
        }
        return acc;
      }, [] as TagOperator[]),
    [operators],
  );

  const handleTagChange = useCallback((tags: string[]) => setTag(tags[0] || ""), []);

  const addOperator = useCallback(() => {
    setOperators([...operators, { id: uuidv4(), type: "rename", originalTag: "", value: "" }]);
  }, [operators]);

  const reset = useCallback(() => {
    setOperators([]);
    setTag("");
    setIsRunning(false);
    setProgress(0);
    setProgressData([]);
    setTotalFiles(0);
    setShowProgress(false);
    if (intervalId) clearInterval(intervalId);
  }, [intervalId]);

  return (
    <Table>
      <Tbody>
        <Tr>
          <Td colSpan={2}>
            <TagSelector
              selectedTags={tag ? [tag] : []}
              onTagsChange={handleTagChange}
              maxSelection={1}
            />
          </Td>
          <Td>
            <IconButton
              variant="outline"
              icon={<AddIcon />}
              aria-label="Add a row"
              onClick={addOperator}
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
        {showProgress && (
          <Tr>
            <Td colSpan={3}>
              <LineGraph data={progressData} />
              <VStack spacing={1} align="stretch">
                <Text fontSize="sm" textAlign="center">
                  {Math.round((progress * totalFiles) / 100)}/{totalFiles} ({Math.round(progress)}%)
                </Text>
                <Progress value={progress} />
              </VStack>
            </Td>
          </Tr>
        )}
        <Tr>
          <Td width="150px">
            <HStack>
              <Button colorScheme="green" onClick={run} disabled={isRunning}>
                Run
              </Button>
              <Button onClick={reset} disabled={isRunning}>
                Reset
              </Button>
            </HStack>
          </Td>
          <Td width="250px" />
        </Tr>
      </Tbody>
    </Table>
  );
};

export default Retagger;
