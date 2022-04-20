import { useState } from "react";
import { useFileRepository } from "providers/fileRepository";
import { useBlanket } from "hooks/useBlanket";

import Butt from "components/reusable/Button";

import { useToast } from "hooks/useToast";

import "./FileMetadataView.scss";

const FileMetadataView = ({ file }) => {
  const [newFile, setNewFile] = useState(JSON.stringify(file, null, 2));
  const [isSaving, setSaving] = useState(false);
  const { enableHotkey, disableHotkey } = useBlanket();
  const { updateFile } = useFileRepository();
  const { enqueue } = useToast();

  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewFile(value);
  };

  const save = () => {
    setSaving(true);
    updateFile(JSON.parse(newFile))
      .then(() => enqueue("File", "Saved"))
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <div>
        <textarea
          className="file-metadata"
          onChange={onChange}
          value={newFile}
          onFocus={() => disableHotkey()}
          onBlur={() => enableHotkey()}
        />
      </div>
      <Butt disabled={isSaving} onClick={save}>
        Save
      </Butt>
    </div>
  );
};

export default FileMetadataView;
