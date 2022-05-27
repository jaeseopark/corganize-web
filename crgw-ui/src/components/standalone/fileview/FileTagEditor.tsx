import cls from "classnames";
import { Permutation } from "js-combinatorics";
import { useMemo, useState } from "react";
import ReactTags, { Tag } from "react-tag-autocomplete";
import { v4 as uuidv4 } from "uuid";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import "./FileTagEditor.scss";

const FileTagEditor = ({ fileid }: { fileid: string }) => {
  const { findById, updateFile } = useFileRepository();
  const { enqueueSuccess, enqueueError } = useToast();
  const { enableHotkey, disableHotkey } = useBlanket();
  const [isProcessing, setProcessing] = useState(false);

  const file = findById(fileid);
  const tags = (file.tags || []).map((t) => ({ id: uuidv4().toString(), name: t }));
  const suggestions = useMemo(() => {
    const uniqueTokens = Array.from(
      new Set(
        file.filename
          .split(/[^A-Za-z]/)
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t)
      )
    );
    const permutations = new Permutation(uniqueTokens, 2).toArray().map((p) => p.join(" "));
    return [...uniqueTokens, ...permutations].map((t) => ({ id: uuidv4().toString(), name: t }));
  }, [file.filename]);

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

  return (
    <div className={cls("file-tag-editor", { disabled: isProcessing })}>
      <ReactTags
        delimiters={["Enter", "Tab", ","]}
        tags={tags}
        suggestions={suggestions}
        onAddition={onAddition}
        onDelete={onDelete}
        onFocus={disableHotkey}
        onBlur={enableHotkey}
        allowNew
      />
    </div>
  );
};

export default FileTagEditor;
