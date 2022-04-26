import { useContext } from "react";

import { CorganizeFile, getActivationEmoji } from "typedefs/CorganizeFile";

import { FileRepository } from "providers/fileRepository/fileRepository";

import { CreateResponse, getInstance } from "clients/corganize";

import { addAll } from "shared/globalstore";

import { getPosixSeconds } from "utils/dateUtils";

export const useFileRepository = () => {
  const {
    state: { files, mostRecentFileid },
    dispatch,
  } = useContext(FileRepository);

  const findById = (fid: string) => files.find((f) => f.fileid === fid)!;

  const mostRecentFile = findById(mostRecentFileid);

  const isMostRecentFile = (f: CorganizeFile) => f.fileid === mostRecentFileid;

  const addFiles = (fs: CorganizeFile[]) => {
    addAll(fs);
    dispatch!({ type: "ADD", payload: fs });
  };

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
        dispatch!({ type: "UPDATE", payload: partialProps });
      });
  };

  const markAsOpened = (fileid: string) => {
    const partialProps: Partial<CorganizeFile> = {
      fileid,
      lastopened: getPosixSeconds(),
      isnewfile: false,
    };

    return updateFile(partialProps).then(() =>
      dispatch!({ type: "SET_MOST_RECENT", payload: fileid })
    );
  };

  /**
   * De/activates a file by its fileid.
   *
   * @param fileid ID of the file to de/activate.
   * @returns A boolean value indicating the new activation state along with the emoji representation.
   */
  const toggleActivation = (fileid: string) => {
    const file = findById(fileid);
    const isActivating = !file.dateactivated;
    const newDateActivated = isActivating ? getPosixSeconds() : 0;

    // Note: Toggling is one use case where the entire file has to be sent to the server.
    const updatePayload = {
      ...file,
      dateactivated: newDateActivated,
    };

    return updateFile(updatePayload).then(() => ({
      activated: isActivating,
      message: isActivating ? "Activated" : "Deactivated",
      emoji: getActivationEmoji(updatePayload),
    }));
  };

  return {
    files,
    isMostRecentFile,
    mostRecentFile,
    addFiles,
    createThenAddFiles,
    updateFile,
    markAsOpened,
    findById,
    toggleActivation,
  };
};
