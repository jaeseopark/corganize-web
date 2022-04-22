import { useContext } from "react";
import { CreateResponse, getInstance } from "clients/corganize";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { getPosixSeconds } from "utils/dateUtils";
import { FileRepository } from "providers/fileRepository";

export const useFileRepository = () => {
  const {
    state: { files, mostRecentFileid },
    dispatch,
    addFiles,
  } = useContext(FileRepository);

  const findById = (fid: string) => files.find((f) => f.fileid === fid)!;

  const mostRecentFile = findById(mostRecentFileid);

  const isMostRecentFile = (f: CorganizeFile) => f.fileid === mostRecentFileid;

  const createThenAddFiles = (fs: CorganizeFile[]): Promise<CreateResponse> => {
    return getInstance()
      .createFiles(fs)
      .then(({ created, skipped }) => {
        addFiles!([...created, ...skipped]);
        return { created, skipped };
      });
  };

  const updateFile = (partialProps: Partial<CorganizeFile>) => {
    if (!partialProps.fileid) {
      return Promise.reject();
    }

    return getInstance()
      .updateFile(partialProps)
      .then(() => {
        dispatch!({ type: "UPDATE", payload: partialProps })
      })
  };

  const markAsOpened = (fileid: string) => {
    const partialProps: Partial<CorganizeFile> = {
      fileid,
      lastopened: getPosixSeconds(),
      isnewfile: false,
    };

    updateFile(partialProps)
      .then(() => dispatch!({ type: "SET_MOST_RECENT", payload: fileid }));
  };

  /**
   * De/activates a file by its fileid.
   * 
   * @param fileid ID of the file to de/activate.
   * @returns A boolean value indicating the new activation state
   */
  const toggleFavourite = (fileid: string) => {
    const { dateactivated } = findById(fileid);
    const partialProps: Partial<CorganizeFile> = {
      fileid,
      dateactivated: !dateactivated ? getPosixSeconds() : 0,
    };
    return updateFile(partialProps).then(() => ({ activated: !!partialProps.dateactivated, emoji: !!partialProps.dateactivated ? "👍" : "👎" }));
  };

  return {
    files,
    isMostRecentFile,
    mostRecentFile,
    createThenAddFiles,
    updateFile,
    markAsOpened,
    findById,
    toggleFavourite,
  };
};
