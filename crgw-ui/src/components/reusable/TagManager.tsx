import { useEffect, useMemo, useRef, useState } from "react";
import ReactTags, { Tag } from "react-tag-autocomplete";
import { v4 as uuidv4 } from "uuid";

import { useBlanket } from "providers/blanket/hook";

import "./TagManager.scss";

const TagManager = ({
  tags,
  suggestions,
  onChange,
}: {
  tags: string[];
  suggestions: string[];
  onChange: (newTags: string[]) => void;
}) => {
  const [typedTags, setTypedTags] = useState<Tag[]>(
    tags.map((t) => ({ id: uuidv4().toString(), name: t }))
  );
  const ref = useRef<ReactTags | null>(null);
  const { enableHotkey, disableHotkey } = useBlanket();
  const typedSuggestions = useMemo(
    () =>
      suggestions.map((s) => ({
        id: uuidv4().toString(),
        name: s,
      })),
    [suggestions]
  );

  useEffect(() => onChange(typedTags.map((t) => t.name)), [typedTags, onChange]);

  const onDelete = (i: number) => {
    const newTags = typedTags.splice(0); // create a clone
    newTags.splice(i, 1);
    setTypedTags(newTags);
  };

  const onAddition = (newTag: Tag) => {
    if (!newTag.name.trim()) return;
    newTag.name = newTag.name.trim();
    setTypedTags([...typedTags, newTag]);
  };

  return (
    <ReactTags
      ref={ref}
      tags={typedTags}
      delimiters={["Enter", "Tab", ","]}
      suggestions={typedSuggestions}
      onDelete={onDelete}
      onAddition={onAddition}
      onFocus={disableHotkey}
      onBlur={enableHotkey}
      allowNew
    />
  );
};

export default TagManager;
