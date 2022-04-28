import { useFileRepository } from "providers/fileRepository/hook";

import FileTags from "components/reusable/FileTags";

const FileHeader = ({ fileid }: { fileid: string }) => {
  const { findById } = useFileRepository();
  const file = findById(fileid);
  const { filename } = file;

  return (
    <label>
      <FileTags f={file} />
      {filename}
    </label>
  );
};

export default FileHeader;
