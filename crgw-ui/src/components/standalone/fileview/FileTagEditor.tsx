import cls from "classnames";
import { useMemo, useState } from "react";
import ReactTags, { Tag } from "react-tag-autocomplete";
import { v4 as uuidv4 } from "uuid";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import { useNavv } from "hooks/navv";

import { getGlobalTags } from "shared/globalstore";

import "./FileTagEditor.scss";

const generateSuggestions = (filename: string) => {
  const tokenizedFilename = filename
    .split(/[^A-Za-z]/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t);
  const tokens = new Set(tokenizedFilename);
  tokenizedFilename.forEach((token, i, ary) => {
    if (i < tokenizedFilename.length - 1) {
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
  const { navRoot } = useNavv();
  const { enableHotkey, disableHotkey } = useBlanket();
  const [isProcessing, setProcessing] = useState(false);

  const file = findById(fileid);
  const tags = (file.tags || []).map((t) => ({ id: uuidv4().toString(), name: t }));
  const suggestions = useMemo(() => generateSuggestions(file.filename), [file.filename]);

  const onChange = (tags: string[]) => {
    const payload = {
      fileid,
      tags,
    };

    setProcessing(true);
    updateFile(payload)
      .then(() => enqueueSuccess({ message: "Tags updated" }))
      .catch((e: Error) => enqueueError({ header: "Failed", message: e.message }))
      .finally(() => setProcessing(false));
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

  const onKeyDown = (e: any) => {
    const { key, shiftKey } = e;
    if (shiftKey && key.toLowerCase() === "q") {
      navRoot();
    }
  };

  return (
    <div className={cls("file-tag-editor", { disabled: isProcessing })} onKeyDown={onKeyDown}>
      <ReactTags
        delimiters={["Enter", "Tab", ","]}
        tags={tags}
        suggestions={suggestions}
        suggestionsFilter={(a, b) => a.name.startsWith(b)}
        onAddition={onAddition}
        onDelete={onDelete}
        onFocus={disableHotkey}
        onBlur={enableHotkey}
        allowNew
        autofocus
      />
    </div>
  );
};

export default FileTagEditor;
