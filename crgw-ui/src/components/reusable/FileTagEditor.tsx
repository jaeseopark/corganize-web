import { useCallback } from "react";

import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import TagSelector from "./TagSelector";

type FileTagEditorProps = {
  fileid: string;
  mini?: boolean;
};

const FileTagEditor = ({ fileid, mini }: FileTagEditorProps) => {
  const { findById, updateFile } = useFileRepository();
  const { enqueueSuccess, enqueueError } = useToast();

  const file = findById(fileid);

  const assignTags = useCallback((tags: string[]) => {
    const payload = {
      fileid,
      tags,
    };

    updateFile(payload)
      .then(() => enqueueSuccess({ message: "Tags updated" }))
      .catch((e: Error) => enqueueError({ header: "Failed", message: e.message }));
  }, [fileid, updateFile, enqueueSuccess, enqueueError]);

  return (
    <TagSelector
      selectedTags={file.tags || []}
      onTagsChange={assignTags}
      autocompSeed={file.filename}
      mini={mini}
      allowNew
      shouldAutofocus
    />
  );
};

export default FileTagEditor;
