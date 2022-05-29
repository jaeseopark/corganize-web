import { useEffect, useMemo } from "react";
import ReactTags, { Tag } from "react-tag-autocomplete";
import { v4 as uuidv4 } from "uuid";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import { useNavv } from "hooks/navv";

import { getGlobalTags } from "shared/globalstore";

import { madReferenceByClassName } from "utils/elementUtils";

import "./FileTagEditor.scss";

const generateSuggestions = (filename: string) => {
  const tokenizedFilename = filename
    .split(/[^A-Za-z0-9]/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t);
  const tokens = new Set(tokenizedFilename);
  tokenizedFilename.forEach((token, i, ary) => {
    if (i < ary.length - 1) {
      const nextToken = ary[i + 1];
      tokens.add([token, nextToken].join(" "));
    }
  });
  getGlobalTags().forEach(tokens.add, tokens);

  return Array.from(tokens).map((t) => ({ id: uuidv4().toString(), name: t }));
};

const FileTagEditor = ({ fileid }: { fileid: string }) => {
  const { findById, updateFile } = useFileRepository();
  const { enqueueSuccess, enqueueError } = useToast();
  const { protectHotkey, exposeHotkey } = useBlanket();

  const file = findById(fileid);
  const tags = (file.tags || []).map((t) => ({ id: uuidv4().toString(), name: t }));
  const suggestions = useMemo(() => generateSuggestions(file.filename), [file.filename]);

  useEffect(() => {
    (async () => {
      const elements = await madReferenceByClassName("react-tags__search-input");
      if (elements) {
        const [inputElement] = elements as HTMLElement[];
        inputElement.focus();
      }
    })();
  }, []);

  const onChange = (tags: string[]) => {
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
      onChange([...tags, newTag].map((t) => t.name));
    }
  };

  const onDelete = (i: number) => {
    if (i < 0) return;
    const clone = tags.slice(0);
    clone.splice(i, 1);
    onChange(clone.map((t) => t.name));
  };

  return (
    <div className="file-tag-editor">
      <ReactTags
        delimiters={["Enter", "Tab", ","]}
        tags={tags}
        suggestions={suggestions}
        suggestionsFilter={(a, b) => a.name.startsWith(b)}
        onAddition={onAddition}
        onDelete={onDelete}
        onFocus={protectHotkey}
        onBlur={exposeHotkey}
        allowNew
      />
    </div>
  );
};

export default FileTagEditor;
