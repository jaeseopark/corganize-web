import { useEffect, useState } from "react";
import { useFileRepository } from "providers/fileRepository/hook";
import { useBlanket } from "providers/blanket/hook";
import { useToast } from "providers/toast/hook";

import { CheckIcon } from "@chakra-ui/icons";

import "./FileMetadataView.scss";

const FileMetadataView = ({ file }) => {
  const [newFile, setNewFile] = useState(JSON.stringify(file, null, 2));
  const { enableHotkey, disableHotkey, addUserAction } = useBlanket();
  const { updateFile } = useFileRepository();
  const { enqueueSuccess } = useToast();

  useEffect(() => {
    const save = () =>
      updateFile(JSON.parse(newFile)).then(() => enqueueSuccess({ message: "Saved" }));

    addUserAction({
      name: "Save",
      icon: <CheckIcon />,
      onClick: save,
    });
  }, []);

  return (
    <textarea
      className="file-metadata"
      onChange={(e) => setNewFile(e.target.value)}
      value={newFile}
      onFocus={disableHotkey}
      onBlur={enableHotkey}
    />
  );
};

export default FileMetadataView;
