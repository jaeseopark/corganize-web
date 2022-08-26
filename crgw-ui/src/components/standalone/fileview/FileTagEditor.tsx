import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Badge, Center, Flex } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import ReactTags, { Tag } from "react-tag-autocomplete";
import { v4 as uuidv4 } from "uuid";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import { globalTags } from "clients/adapter";

import { madFocusByClassName } from "utils/elementUtils";

import "./FileTagEditor.scss";

const AUTOCOMP_DISPLAY_LENGTH = 5;
const AUTOCOMP_TOKEN_LENGTH_LIMIT = 3; // most tags are 3 words or less

const getTokens = (filename: string) => {
  const tokenizedFilename = filename
    .split(/[^A-Za-z0-9]/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t);
  const tokens = new Set(tokenizedFilename); // this line takes care of the case where tokenLength == 1
  for (let tokenLength = 2; tokenLength <= AUTOCOMP_TOKEN_LENGTH_LIMIT; tokenLength++) {
    tokenizedFilename.forEach((_, i, ary) => {
      const j = i + tokenLength;
      if (j <= ary.length) {
        tokens.add(ary.slice(i, j).join(" "));
      }
    });
  }
  return tokens;
};

const generateSuggestions = (filename: string) => {
  const tokens = getTokens(filename);
  globalTags.forEach(tokens.add, tokens);
  return Array.from(tokens).map((t) => ({ id: uuidv4().toString(), name: t }));
};

const normalizeForAutocomplete = (s: string) => s.replaceAll(" ", "");

const buildAutocompleteIndex = () =>
  Array.from(globalTags).reduce((acc, next) => {
    acc[next] = [next];
    const normalized = normalizeForAutocomplete(next);
    if (!(normalized in acc)) {
      acc[normalized] = [];
    }
    acc[normalized].push(next);
    return acc;
  }, {} as { [key: string]: string[] });

type FileTagEditorProps = { fileid: string; autofocus?: boolean };

const FileTagEditorr = ({ fileid, autofocus }: FileTagEditorProps) => {
  const { findById, updateFile } = useFileRepository();
  const { enqueueSuccess, enqueueError } = useToast();
  const { protectHotkey, exposeHotkey } = useBlanket();
  const [autocompEnabled, setAutocompEnabled] = useState(true);
  const [candidates, setCandidates] = useState<string[]>([]);

  const file = findById(fileid);
  const tags = (file.tags || []).map((t) => ({ id: uuidv4().toString(), name: t }));
  const suggestions = useMemo(() => generateSuggestions(file.filename), [file.filename]);

  /**
   * Focuses the input element when the component mounts; allowing the user to start typing right away.
   */
  useEffect(() => {
    if (autofocus !== undefined) {
      madFocusByClassName("react-tags__search-input");
    }
  }, []);

  /**
   * Generates the autocomplete candidates, if applicable.
   */
  useEffect(() => {
    if (tags.length === 0) {
      const autocompleteIndex = buildAutocompleteIndex();
      const matches = Array.from(getTokens(file.filename))
        .map((t) => autocompleteIndex[normalizeForAutocomplete(t)])
        .filter((t) => t);
      if (matches.length > 0) {
        setCandidates(Array.from(new Set(matches.flat(2))));
      }
    }
  }, []);

  const assignTags = (tags: string[]) => {
    const payload = {
      fileid,
      tags,
    };

    updateFile(payload)
      .then(() => enqueueSuccess({ message: "Tags updated" }))
      .catch((e: Error) => enqueueError({ header: "Failed", message: e.message }));
  };

  const onAddition = (newTag: Tag) => {
    newTag.name = newTag.name.trim();
    if (newTag.name) {
      assignTags([...(file.tags || []), newTag.name.toLowerCase()]);
    }
    setAutocompEnabled(true);
  };

  const onDelete = (i: number) => {
    if (i < 0) return;
    const clone = (file.tags || []).slice(0);
    clone.splice(i, 1);
    assignTags(clone);
  };

  const acceptCandidate = () => {
    const [candidate, ...rest] = candidates;
    assignTags([...(file.tags || []), candidate]);
    setCandidates(rest);
  };

  const rejectCandidate = () => {
    const [_, ...rest] = candidates;
    setCandidates(rest);
  };

  /**
   * Enables the autocomplete mode only when user isn't typing.
   * @param query search string from the input component
   */
  const onInput = (query: string) => {
    const shouldEnableAutocomp = !query.trim();
    if (autocompEnabled !== shouldEnableAutocomp) {
      setAutocompEnabled(shouldEnableAutocomp);
    }
  };

  const onKeyDown = (e: any) => {
    const { key } = e;
    if (!autocompEnabled || candidates.length === 0) {
      return;
    }

    if (key === "ArrowUp") {
      acceptCandidate();
    } else if (key === "ArrowDown") {
      rejectCandidate();
    }
  };

  const AutocompleteView = () => {
    if (candidates.length === 0) {
      return null;
    }

    const [first, ...rest] = candidates;

    return (
      <Flex className="autocomplete-candidates" direction="row">
        <div>
          <Center>
            <ChevronUpIcon className="arrow up" />
          </Center>
          <Center>
            <Badge className="candidate first">{first}</Badge>
          </Center>
          <Center>
            <ChevronDownIcon className="arrow down" />
          </Center>
        </div>
        <Center className="upcoming">
          {rest.slice(0, AUTOCOMP_DISPLAY_LENGTH).map((c) => (
            <Badge key={c} className="candidate">
              {c}
            </Badge>
          ))}
        </Center>
      </Flex>
    );
  };

  return (
    <div className="file-tag-editor" onKeyDown={onKeyDown}>
      <ReactTags
        delimiters={["Enter", "Tab", ","]}
        tags={tags}
        suggestions={suggestions}
        suggestionsFilter={(a, b) => a.name.startsWith(b.toLowerCase())}
        onInput={onInput}
        onAddition={onAddition}
        onDelete={onDelete}
        onFocus={protectHotkey}
        onBlur={exposeHotkey}
        allowNew
      />
      <AutocompleteView />
    </div>
  );
};

const FileTagEditor = ({ fileid }: FileTagEditorProps) => (
  <FileTagEditorr fileid={fileid} autofocus />
);

export const EmbeddableFileTagEditor = ({ fileid }: FileTagEditorProps) => (
  <FileTagEditorr fileid={fileid} />
);

export default FileTagEditor;
