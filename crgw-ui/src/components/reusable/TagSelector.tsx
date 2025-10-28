import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Badge, Center, Flex, Spinner } from "@chakra-ui/react";
import cls from "classnames";
import { decode } from "leet-decode";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReactTags } from "react-tag-autocomplete";
import type { TagSelected, TagSuggestion } from "react-tag-autocomplete";
import { v4 as uuidv4 } from "uuid";

import { useBlanket } from "providers/blanket/hook";

import { globalTags } from "clients/adapter";

import "./TagSelector.scss";
import { matchSorter } from "match-sorter";

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

const generateSuggestions = (tokens: Set<string>, minLength: number) => {
  globalTags.forEach(tokens.add, tokens);
  return Array.from(tokens)
    .filter((t) => t.length >= minLength)
    .map((t) => ({ value: uuidv4().toString(), label: t }));
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

type TagSelectorProps = {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  autocompSeed?: string;
  maxSelection?: number;
  minSuggestedTagLength?: number;
  mini?: boolean;
  allowNew?: boolean;
  shouldAutofocus?: boolean;
};

const TagSelector = ({
  selectedTags,
  onTagsChange,
  autocompSeed = "",
  maxSelection,
  minSuggestedTagLength = 2,
  mini = true,
  allowNew = false,
  shouldAutofocus = false,
}: TagSelectorProps) => {
  const { protectHotkey, exposeHotkey } = useBlanket();
  const [autocompEnabled, setAutocompEnabled] = useState(true);
  const [autocompCandidates, setAutocompCandidates] = useState<string[]>([]);

  const tags: TagSelected[] = selectedTags.map((t) => ({ value: uuidv4().toString(), label: t }));
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const apiRef = useRef<any>(null);

  /**
   * Focuses the input element when the component mounts; allowing the user to start typing right away.
   */
  useEffect(() => {
    if (shouldAutofocus) {
      setTimeout(() => apiRef.current?.input.focus(), 100);
    }
    return exposeHotkey; // expose the hot key when the component gets unmounted.
  }, [exposeHotkey]);

  /**
   * Generates the autocomplete candidates and suggestions when the component mounts or autocompSeed changes.
   */
  useEffect(() => {
    if (autocompSeed) {
      const tokens = getTokens(autocompSeed);
      const autocompleteIndex = buildAutocompleteIndex();
      const matches = Array.from(tokens)
        .map((t) => autocompleteIndex[normalizeForAutocomplete(t)])
        .filter((t) => t);
      if (matches.length > 0) {
        const isBrandNew = (t: string) => !selectedTags.includes(t);
        setAutocompCandidates(Array.from(new Set(matches.flat(2).filter(isBrandNew))));
      }
      setSuggestions(generateSuggestions(tokens, minSuggestedTagLength));
    } else {
      // If no autocompSeed, just use global tags filtered by min length
      const tokens = new Set<string>();
      setSuggestions(generateSuggestions(tokens, minSuggestedTagLength));
    }
  }, [autocompSeed, selectedTags, minSuggestedTagLength]);

  const onAddition = useCallback((newTag: TagSelected) => {
    newTag.label = newTag.label.trim();
    if (newTag.label) {
      if (!selectedTags.includes(newTag.label)) {
        const newTags = [...selectedTags, newTag.label.toLowerCase()];
        if (!maxSelection || newTags.length <= maxSelection) {
          onTagsChange(newTags);
        }
      }
    }
    setAutocompEnabled(true);
  }, [selectedTags, onTagsChange, maxSelection, setAutocompEnabled]);

  const onDelete = useCallback((i: number) => {
    if (i < 0) return;
    const clone = selectedTags.slice(0);
    clone.splice(i, 1);
    onTagsChange(clone);
  }, [selectedTags, onTagsChange]);

  const acceptCandidate = useCallback(() => {
    const [candidate, ...rest] = autocompCandidates;
    const newTags = [...selectedTags, candidate];
    if (!maxSelection || newTags.length <= maxSelection) {
      onTagsChange(newTags);
      setAutocompCandidates(rest);
    }
  }, [autocompCandidates, selectedTags, onTagsChange, maxSelection, setAutocompCandidates]);

  const rejectCandidate = useCallback(() => {
    const [, ...rest] = autocompCandidates;
    setAutocompCandidates(rest);
  }, [autocompCandidates, setAutocompCandidates]);

  /**
   * Enables the autocomplete mode only when user isn't typing.
   * @param query search string from the input component
   */
  const onInput = useCallback((query: string) => {
    const shouldEnableAutocomp = !query.trim();
    if (autocompEnabled !== shouldEnableAutocomp) {
      setAutocompEnabled(shouldEnableAutocomp);
    }
  }, [autocompEnabled, setAutocompEnabled]);

  const onKeyDown = useCallback((e: any) => {
    const { key } = e;
    if (!autocompEnabled || autocompCandidates.length === 0) {
      return;
    }

    if (key === "ArrowUp") {
      acceptCandidate();
    } else if (key === "ArrowDown") {
      rejectCandidate();
    }
  }, [autocompEnabled, autocompCandidates, acceptCandidate, rejectCandidate]);

  const AutocompleteView = () => {
    if (autocompCandidates.length === 0) {
      return null;
    }

    const [first, ...rest] = autocompCandidates;

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

  if (suggestions.length === 0 && autocompSeed) {
    return (
      <Center className="spinner">
        <Spinner size="xl" />
      </Center>
    );
  }

  const placeholderText = maxSelection && selectedTags.length >= maxSelection 
    ? `Maximum ${maxSelection} tags reached` 
    : "";

  return (
    <div className={cls("tag-selector", { mini })} onKeyDown={onKeyDown}>
      <ReactTags
        ref={apiRef}
        delimiterKeys={["Enter", "Tab", ","]}
        selected={tags}
        suggestions={suggestions}
        suggestionsTransform={(query, suggestions) =>
          matchSorter(suggestions, query, { keys: ['label'] }).slice(0, 10)
        }
        onInput={onInput}
        onAdd={onAddition}
        onDelete={onDelete}
        onFocus={protectHotkey}
        onBlur={exposeHotkey}
        onShouldExpand={(value) => value.trim().length > 0}
        placeholderText={placeholderText}
        labelText="" // Add this to remove the default "Select tags" label
        tagListLabelText=""
        allowNew={allowNew && (!maxSelection || selectedTags.length < maxSelection)}
      />
      <AutocompleteView />
    </div>
  );
};

export default TagSelector;
