import { CheckIcon } from "@chakra-ui/icons";
import cls from "classnames";
import { useEffect, useState } from "react";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import "./FileJsonEditor.scss";

const FileJsonEditor = ({ fileid }: { fileid: string }) => {
  const [jsonError, setJsonError] = useState<Error>();

  const { protectHotkey, exposeHotkey, upsertUserAction } = useBlanket();
  const { enqueueSuccess, enqueueError } = useToast();
  const { updateFile, findById, renew } = useFileRepository();

  const file = findById(fileid);

  const [edit, setEdit] = useState<string>(JSON.stringify(file, null, 2));

  const editAsObjectAsync = async () => {
    try {
      const j = JSON.parse(edit!) as CorganizeFile;
      setJsonError(undefined);
      return j;
    } catch (e) {
      setJsonError(e as Error);
      throw e;
    }
  };

  const save = () =>
    editAsObjectAsync()
      .then(updateFile)
      .then(() => enqueueSuccess({ message: "Saved" }))
      .catch((err) => enqueueError({ message: err.message }));

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
  }, [file, edit]);

  useEffect(() => {
    editAsObjectAsync().catch(() => {});
  }, [edit]);

  return (
    <div className="file-metadata-view">
      <textarea
        className={cls("json-editor", { error: jsonError })}
        onChange={(e) => setEdit(e.target.value)}
        value={edit}
        onFocus={protectHotkey}
        onBlur={exposeHotkey}
        autoFocus
      />
    </div>
  );
};

export default FileJsonEditor;
