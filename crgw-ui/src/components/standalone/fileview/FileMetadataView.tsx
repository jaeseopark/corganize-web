import { CheckIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import "./FileMetadataView.scss";

const FileMetadataView = ({ fileid }: { fileid: string }) => {
  const { enableHotkey, disableHotkey, upsertUserAction } = useBlanket();
  const { enqueueSuccess, enqueueError } = useToast();

  const { updateFile, findById, renew } = useFileRepository();
  const file = findById(fileid);

  const [edit, setEdit] = useState<string>(JSON.stringify(file, null, 2));

  const save = async () => {
    const payload = JSON.parse(edit!);
    try {
      await updateFile(payload);
      enqueueSuccess({ message: "Saved" });
    } catch (e) {
      enqueueError({ message: (e as Error).message });
    }
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
  }, []);

  return (
    <textarea
      className="file-metadata"
      onChange={(e) => {
        setEdit(e.target.value);
      }}
      value={edit}
      onFocus={disableHotkey}
      onBlur={enableHotkey}
    />
  );
};

export default FileMetadataView;
