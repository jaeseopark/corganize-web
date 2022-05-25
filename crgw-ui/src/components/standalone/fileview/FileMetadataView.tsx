import { CheckIcon } from "@chakra-ui/icons";
import { useEffect, useMemo, useState } from "react";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import TagManager from "components/reusable/TagManager";

import "./FileMetadataView.scss";

const FileMetadataView = ({ fileid }: { fileid: string }) => {
  const { enableHotkey, disableHotkey, upsertUserAction } = useBlanket();
  const { enqueueSuccess, enqueueError } = useToast();

  const { updateFile, findById, renew } = useFileRepository();
  const file = findById(fileid);

  const [edit, setEdit] = useState<string>(JSON.stringify(file, null, 2));
  const tagSuggestions = useMemo(() => {
    const tokens = file.filename
      .split(/[^A-Za-z]/)
      .filter((s) => s.trim())
      .map((s) => s.toLowerCase());
    const uniqueTokens = Array.from(new Set(tokens));
    return uniqueTokens; // TODO: permutations
  }, [file]);

  const save = () => {
    (async () => JSON.parse(edit!))()
      .then(updateFile)
      .then(() => enqueueSuccess({ message: "Saved" }))
      .catch((err) => enqueueError({ message: err.message }));
  };

  const renewwww = () => renew(fileid).then(() => enqueueSuccess({ message: "Renewed" }));

  useEffect(() => {
    upsertUserAction({
      name: "Save",
      icon: <CheckIcon />,
      onClick: save,
    });
    upsertUserAction({
      name: "Renew",
      onClick: renewwww,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTagChange = (newTags: string[]) => {
    const newFile = JSON.parse(edit!) as CorganizeFile;
    newFile.tags = newTags.length > 0 ? newTags : undefined;
    setEdit(JSON.stringify(newFile, null, 2));
  };

  return (
    <div className="file-metadata-view">
      <textarea
        className="json-editor"
        onChange={(e) => {
          setEdit(e.target.value);
        }}
        value={edit}
        onFocus={disableHotkey}
        onBlur={enableHotkey}
      />
      <TagManager tags={file.tags || []} suggestions={tagSuggestions} onChange={onTagChange} />
    </div>
  );
};

export default FileMetadataView;
