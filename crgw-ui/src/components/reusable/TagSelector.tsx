import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Badge, Center, Flex, Spinner } from "@chakra-ui/react";
import cls from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactTags } from "react-tag-autocomplete";
import type { SuggestionsTransform, TagSelected, TagSuggestion } from "react-tag-autocomplete";
import { v4 as uuidv4 } from "uuid";

import { useBlanket } from "providers/blanket/hook";

import { globalTags } from "clients/adapter";

import "./TagSelector.scss";
import fuzzysort from "fuzzysort";

const AUTOCOMP_DISPLAY_LENGTH = 5;
const AUTOCOMP_TOKEN_LENGTH_LIMIT = 3; // most tags are 3 words or less

const getAutocompTokens = (autocompSeed: string): Set<string> => {
  const tokenizedautocompSeed = autocompSeed
    .split(/[^A-Za-z0-9]/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 1);
  const tokens = new Set(tokenizedautocompSeed);
  for (let tokenLength = 2; tokenLength <= AUTOCOMP_TOKEN_LENGTH_LIMIT; tokenLength++) {
    tokenizedautocompSeed.forEach((_, i, ary) => {
      const j = i + tokenLength;
      if (j <= ary.length) {
        tokens.add(ary.slice(i, j).join(" "));
      }
    });
  }
  return tokens;
};

const generateSuggestions = (autocompCandidates: string[]): TagSuggestion[] => {
  const allTags = new Set([...autocompCandidates, ...Array.from(globalTags)]);
  return Array.from(allTags).map((t) => ({ value: uuidv4().toString(), label: t }));
};

const getNormalizeAutocompKey = (s: string) => s.replaceAll(" ", "");

const buildAutocompleteIndex = () =>
  Array.from(globalTags).reduce(
    (acc, next) => {
      acc[next] = [next];
      const normKey = getNormalizeAutocompKey(next);
      acc[normKey] = acc[normKey] || [];
      acc[normKey].push(next);
      return acc;
    },
    {} as { [key: string]: string[] },
  );

type TagSelectorProps = {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  autocompSeed?: string;
  maxSelection?: number;
  mini?: boolean;
  allowNew?: boolean;
  shouldAutofocus?: boolean;
};

const TagSelector = ({
  selectedTags,
  onTagsChange,
  autocompSeed = "",
  maxSelection,
  mini = true,
  allowNew = false,
  shouldAutofocus = false,
}: TagSelectorProps) => {
  const { protectHotkey, exposeHotkey } = useBlanket();
  const apiRef = useRef<any>(null);
  const tags: TagSelected[] = selectedTags.map((t) => ({ value: uuidv4().toString(), label: t }));
  
  // Autocomp states:
  const [autocompEnabled, setAutocompEnabled] = useState(true);
  const [rejectedAutocompCandidates, setRejectedAutocompCandidates] = useState<string[]>([]);
  const autocompCandidates = useMemo(() => {
    const tokens = getAutocompTokens(autocompSeed);
    const autocompleteIndex = buildAutocompleteIndex();
    const matches = Array.from(tokens)
      .map((t) => autocompleteIndex[getNormalizeAutocompKey(t)])
      .filter((t) => t);
    if (matches.length > 0) {
      const isNotRejected = (t: string) => !rejectedAutocompCandidates.includes(t);
      return Array.from(new Set(matches.flat(2))).filter(isNotRejected);
    }
    return [];
  }, [autocompSeed, rejectedAutocompCandidates]);

  // Suggestions:
  const suggestions: TagSuggestion[] = useMemo(() => generateSuggestions(autocompCandidates), [autocompCandidates]);

  /**
   * Focuses the input element when the component mounts; allowing the user to start typing right away.
   */
  useEffect(() => {
    if (shouldAutofocus) {
      setTimeout(() => apiRef.current?.input.focus(), 100);
    }
    return exposeHotkey; // expose the hot key when the component gets unmounted.
  }, [exposeHotkey]);


  const onAddition = useCallback(
    (newTag: TagSelected) => {
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
    },
    [selectedTags, onTagsChange, maxSelection, setAutocompEnabled],
  );

  const onDelete = useCallback(
    (i: number) => {
      if (i < 0) return;
      const clone = selectedTags.slice(0);
      clone.splice(i, 1);
      onTagsChange(clone);
    },
    [selectedTags, onTagsChange],
  );

  const acceptCandidate = useCallback(() => {
    const [candidate] = autocompCandidates;
    const newTags = [...selectedTags, candidate];
    if (!maxSelection || newTags.length <= maxSelection) {
      onTagsChange(newTags);
    }
  }, [autocompCandidates, selectedTags, onTagsChange, maxSelection]);

  const rejectCandidate = useCallback(() => {
    setRejectedAutocompCandidates((prev) => [...prev, autocompCandidates[0]]);
  }, [autocompCandidates]);

  /**
   * Enables the autocomplete mode only when user isn't typing.
   * @param query search string from the input component
   */
  const onInput = useCallback(
    (query: string) => {
      const shouldEnableAutocomp = !query.trim();
      if (autocompEnabled !== shouldEnableAutocomp) {
        setAutocompEnabled(shouldEnableAutocomp);
      }
    },
    [autocompEnabled],
  );

  const onKeyDown = useCallback(
    (e: any) => {
      const { key } = e;
      if (!autocompEnabled || autocompCandidates.length === 0) {
        return;
      }

      if (key === "Enter") {
        e.preventDefault();
        acceptCandidate();
      } else if (key === "ArrowUp") {
        acceptCandidate();
      } else if (key === "ArrowDown") {
        rejectCandidate();
      } 
    },
    [autocompEnabled, autocompCandidates, acceptCandidate, rejectCandidate],
  );

  const suggestionsTransform: SuggestionsTransform = useCallback(
    (query: string, suggestions: TagSuggestion[]) => {
      if (query.trim().length === 0) {
        return [];
      }

      const results = fuzzysort.go(query, suggestions, { key: 'label' });
      return results.slice(0, 10).map(r => r.obj);
    },
    [],
  );

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

  const placeholderText =
    maxSelection && selectedTags.length >= maxSelection
      ? `Maximum ${maxSelection} tags reached`
      : "";

  return (
    <div className={cls("tag-selector", { mini })} onKeyDown={onKeyDown}>
      <ReactTags
        ref={apiRef}
        delimiterKeys={["Enter"]}
        selected={tags}
        suggestions={suggestions}
        suggestionsTransform={suggestionsTransform}
        onInput={onInput}
        onAdd={onAddition}
        onDelete={onDelete}
        onFocus={protectHotkey}
        onBlur={exposeHotkey}
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
