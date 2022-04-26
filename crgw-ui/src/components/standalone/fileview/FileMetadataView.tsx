import { CheckIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import "./FileMetadataView.scss";

const FileMetadataView = ({ file }: { file: CorganizeFile }) => {
  const { enableHotkey, disableHotkey, upsertUserAction } = useBlanket();
  const { updateFile } = useFileRepository();
  const { enqueueSuccess, enqueueError } = useToast();
  const [edit, setEdit] = useState<string>(JSON.stringify(file, null, 2));

  const save = () => {
    (async () => JSON.parse(edit!))()
      .then(updateFile)
      .then(() => enqueueSuccess({ message: "Saved" }))
      .catch((err) => enqueueError({ message: err.message }));
  };

  useEffect(() => {
    upsertUserAction({
      name: "Save",
      icon: <CheckIcon />,
      onClick: save,
    });
  });

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
