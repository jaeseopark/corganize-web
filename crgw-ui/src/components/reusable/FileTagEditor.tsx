import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Badge, Center, Flex, Spinner } from "@chakra-ui/react";
import cls from "classnames";
import { decode } from "leet-decode";
import { useEffect, useRef, useState } from "react";
import { ReactTags } from "react-tag-autocomplete";
import type { TagSelected, TagSuggestion } from "react-tag-autocomplete";
import { v4 as uuidv4 } from "uuid";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import { globalTags } from "clients/adapter";

import "./FileTagEditor.scss";

const AUTOCOMP_DISPLAY_LENGTH = 5;
const AUTOCOMP_TOKEN_LENGTH_LIMIT = 3; // most tags are 3 words or less
const SHOULD_DECODE_LEET_TEXT = false;

const decodeLeetText = (text: string): string => {
  // this lib is so slow?
  return decode(text)[0];
};

const getTokens = (filename: string): Set<string> => {
  const getTokensss = (filename: string) => {
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

  const tokens = getTokensss(filename);
  if (SHOULD_DECODE_LEET_TEXT) {
    const leetTokens = getTokensss(decodeLeetText(filename));
    leetTokens.forEach(tokens.add, tokens);
  }

  return tokens;
};

const generateSuggestions = (tokens: Set<string>) => {
  globalTags.forEach(tokens.add, tokens);
  return Array.from(tokens).map((t) => ({ value: uuidv4().toString(), label: t }));
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

type FileTagEditorProps = {
  fileid: string;
  mini?: boolean;
};

const FileTagEditor = ({ fileid, mini }: FileTagEditorProps) => {
  const { findById, updateFile } = useFileRepository();
  const { enqueueSuccess, enqueueError } = useToast();
  const { protectHotkey, exposeHotkey } = useBlanket();
  const [autocompEnabled, setAutocompEnabled] = useState(true);
  const [candidates, setCandidates] = useState<string[]>([]);

  const file = findById(fileid);
  const tags: TagSelected[] = (file.tags || []).map((t) => ({ value: uuidv4().toString(), label: t }));
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const apiRef = useRef<any>(null);

  /**
   * Focuses the input element when the component mounts; allowing the user to start typing right away.
   */
  useEffect(() => {
    setTimeout(() => apiRef.current?.input.focus(), 100);
    return exposeHotkey; // expose the hot key when the component gets unmounted.
  }, []);

  /**
   * Generates the autocomplete candidates and suggestions when the component mounts.
   */
  useEffect(() => {
    const tokens = getTokens(file.filename);
    const autocompleteIndex = buildAutocompleteIndex();
    const matches = Array.from(tokens)
      .map((t) => autocompleteIndex[normalizeForAutocomplete(t)])
      .filter((t) => t);
    if (matches.length > 0) {
      const tags = file.tags || [];
      const isBrandNew = (t: string) => !tags.includes(t);
      setCandidates(Array.from(new Set(matches.flat(2).filter(isBrandNew))));
    }
    setSuggestions(generateSuggestions(tokens));
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

  const onAddition = (newTag: TagSelected) => {
    const tagss = file.tags || [];
    newTag.label = newTag.label.trim();
    if (newTag.label) {
      if (!tagss.includes(newTag.label)) {
        assignTags([...tagss, newTag.label.toLowerCase()]);
      }
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
    const [, ...rest] = candidates;
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

  if (suggestions.length === 0) {
    return (
      <Center className="spinner">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <div className={cls("file-tag-editor", { mini })} onKeyDown={onKeyDown}>
      <ReactTags
        ref={apiRef}
        delimiterKeys={["Enter", "Tab", ","]}
        selected={tags}
        suggestions={suggestions}
        suggestionsTransform={(query, suggestions) => {
          if (!query.trim()) return suggestions;
          return suggestions.filter(s => s.label.toLowerCase().startsWith(query.toLowerCase()));
        }}
        onInput={onInput}
        onAdd={onAddition}
        onDelete={onDelete}
        onFocus={protectHotkey}
        onBlur={exposeHotkey}
        placeholderText=""
        allowNew
      />
      <AutocompleteView />
    </div>
  );
};

export default FileTagEditor;
