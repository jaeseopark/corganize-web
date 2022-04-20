import { CorganizeFile } from "typedefs/CorganizeFile";
import Butt from "components/reusable/Button";

type FileActionsProps = {
  file: CorganizeFile;
  openFile: (f: CorganizeFile) => void;
};

const FileActions = ({ file, openFile }: FileActionsProps) => {
  const { streamingurl } = file;

  const maybeRenderOpenButton = () => {
    if (streamingurl) {
      return <Butt onClick={() => openFile(file)}>Open</Butt>;
    }
    return <Butt disabled>DL</Butt>;
  };

  return <div className="fileactions">{maybeRenderOpenButton()}</div>;
};

export default FileActions;
