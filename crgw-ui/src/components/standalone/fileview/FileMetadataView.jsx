import { useEffect, useState } from "react";
import { useFileRepository } from "hooks/useFileRepository";
import { useBlanket } from "hooks/useBlanket";
import { useToast } from "hooks/useToast";

import { CheckIcon } from "@chakra-ui/icons";

import "./FileMetadataView.scss";

const FileMetadataView = ({ file }) => {
  const [newFile, setNewFile] = useState(JSON.stringify(file, null, 2));
  const { enableHotkey, disableHotkey, addUserAction } = useBlanket();
  const { updateFile } = useFileRepository();
  const { enqueue } = useToast();

  useEffect(() => {
    const save = () => updateFile(JSON.parse(newFile)).then(() => enqueue({ body: "Saved" }));

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
