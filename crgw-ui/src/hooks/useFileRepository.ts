import { useContext } from "react";
import { CreateResponse, getInstance } from "clients/corganize";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { getPosixSeconds } from "utils/dateUtils";
import { didChange } from "utils/objectUtils";
import { FileRepository } from "providers/fileRepository";

export const useFileRepository = () => {
  const {
    state: { files, mostRecentFileid },
    dispatch,
    addFiles,
  } = useContext(FileRepository);

  const findById = (fid: string): CorganizeFile =>
    files.find((f) => f.fileid === fid) as CorganizeFile;

  const createThenAddFiles = (fs: CorganizeFile[]): Promise<CreateResponse> => {
    return getInstance()
      .createFiles(fs)
      .then(({ created, skipped }) => {
        addFiles!([...created, ...skipped]);
        return { created, skipped };
      });
  };

  const updateFile = (newFile: CorganizeFile): Promise<CorganizeFile> => {
    const file = findById(newFile.fileid);
    if (didChange(file, newFile)) {
      // TODO: update remote server first
      return new Promise((resolve) => {
        dispatch!({ type: "UPDATE", payload: newFile });
        resolve(newFile);
      });
    }
    return Promise.reject();
  };

  const markAsOpened = (fid: string) => {
    const file = findById(fid);
    dispatch!({
      type: "UPDATE",
      payload: {
        ...file,
        lastopened: getPosixSeconds(),
        isnewfile: false,
      },
    });
    dispatch!({ type: "SET_MOST_RECENT", payload: fid });
  };

  const toggleFavourite = (fid: string) => {
    const file = findById(fid);
    dispatch!({
      type: "UPDATE",
      payload: {
        ...file,
        dateactivated: !file.dateactivated ? getPosixSeconds() : 0,
      },
    });
  };

  return {
    files,
    mostRecentFileid,
    createThenAddFiles,
    updateFile,
    markAsOpened,
    findById,
    toggleFavourite,
  };
};
