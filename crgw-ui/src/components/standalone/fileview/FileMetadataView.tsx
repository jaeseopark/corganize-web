import { useEffect, useMemo, useState } from "react";
import { useFileRepository } from "hooks/fileRepository";
import { useBlanket } from "providers/blanket/hook";
import { useToast } from "providers/toast/hook";

import { CheckIcon } from "@chakra-ui/icons";

import "./FileMetadataView.scss";
import { CorganizeFile } from "typedefs/CorganizeFile";

const FileMetadataView = ({ file }: { file: CorganizeFile }) => {
  const serializedFile = useMemo(() => JSON.stringify(file, null, 2), []);
  const [edit, setEdit] = useState<string>(serializedFile);
  const { enableHotkey, disableHotkey, addUserAction } = useBlanket();
  const { updateFile } = useFileRepository();
  const { enqueueSuccess } = useToast();

  const save = () => {
    const enq = () => enqueueSuccess({ message: "Saved" });
    const deserialized = JSON.parse(edit);
    updateFile(deserialized).then(enq);
  };

  useEffect(() => {
    addUserAction({
      name: "Save",
      icon: <CheckIcon />,
      onClick: save,
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
