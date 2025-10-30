import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Badge, Center, Flex, Spinner } from "@chakra-ui/react";
import cls from "classnames";
import fuzzysort from "fuzzysort";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactTags } from "react-tag-autocomplete";
import type { SuggestionsTransform, TagSelected, TagSuggestion } from "react-tag-autocomplete";
import { v4 as uuidv4 } from "uuid";

import { useBlanket } from "providers/blanket/hook";

import { globalTags } from "clients/adapter";

import "./TagSelector.scss";

const AUTOCOMP_DISPLAY_LENGTH = 5;
const AUTOCOMP_TOKEN_LENGTH_LIMIT = 3; // most tags are 3 words or less

const getAutocompTokens = (autocompSeed: string): string[] => {
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
  return Array.from(tokens);
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
  const autocompTokens = useMemo(() => getAutocompTokens(autocompSeed), [autocompSeed]);
  const autocompCandidates = useMemo(() => {
    const autocompleteIndex = buildAutocompleteIndex();
    const matches = Array.from(autocompTokens)
      .map((t) => autocompleteIndex[getNormalizeAutocompKey(t)])
      .filter((t) => t);
    if (matches.length > 0) {
      const isNotRejected = (t: string) => !rejectedAutocompCandidates.includes(t);
      const alreadySelected = (t: string) => !selectedTags.includes(t.toLowerCase());
      return Array.from(new Set(matches.flat(2)))
        .filter(isNotRejected)
        .filter(alreadySelected);
    }
    return [];
  }, [autocompSeed, rejectedAutocompCandidates, autocompTokens, selectedTags]);

  // Suggestions:
  const suggestions: TagSuggestion[] = useMemo(
    () => generateSuggestions(autocompTokens),
    [autocompTokens],
  );

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
      if (key === "Enter") {
        const inputValue = apiRef.current?.input?.value?.trim();
        const highlightedOption = apiRef.current?.listBox.activeOption;
        if (
          allowNew &&
          inputValue &&
          !highlightedOption &&
          (!maxSelection || selectedTags.length < maxSelection) &&
          !selectedTags.includes(inputValue.toLowerCase())
        ) {
          onTagsChange([...selectedTags, inputValue.toLowerCase()]);
          if (apiRef.current?.input) {
            apiRef.current.input.value = "";
          }
          e.preventDefault();
          return;
        }
      }

      if (!autocompEnabled || autocompCandidates.length === 0) {
        return;
      }

      if (key === "ArrowUp") {
        acceptCandidate();
      } else if (key === "ArrowDown") {
        rejectCandidate();
      }
    },
    [
      autocompEnabled,
      autocompCandidates,
      acceptCandidate,
      rejectCandidate,
      allowNew,
      maxSelection,
      selectedTags,
      onTagsChange,
    ],
  );

  const suggestionsTransform: SuggestionsTransform = useCallback(
    (query: string, suggestions: TagSuggestion[]) => {
      return fuzzysort
        .go(query, suggestions, {
          keys: ["label"],
          scoreFn: (r) => r.score * (autocompTokens.includes(r.obj.label) ? 2 : 1),
        })
        .slice(0, 10)
        .map((r) => r.obj);
    },
    [autocompTokens],
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
        onShouldExpand={(query: string) => query.trim().length > 0}
        placeholderText={placeholderText}
        labelText="" // Add this to remove the default "Select tags" label
        tagListLabelText=""
      />
      <AutocompleteView />
    </div>
  );
};

export default TagSelector;
