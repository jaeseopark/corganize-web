import { useFileRepository } from "providers/fileRepository/hook";

import FileMetadataTags from "components/reusable/FileMetadataTag";

const FileHeader = ({ fileid }: { fileid: string }) => {
  const { findById } = useFileRepository();
  const file = findById(fileid);
  const { filename } = file;

  return (
    <label>
      <FileMetadataTags f={file} />
      {filename}
    </label>
  );
};

export default FileHeader;
