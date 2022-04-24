import { useSelector, useDispatch } from "react-redux";
import { CreateResponse, getInstance } from "clients/corganize";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { getPosixSeconds } from "utils/dateUtils";
import { addAll } from "shared/globalstore";
import { add, patch, setMostRecent } from "redux/fileRepositorySlice";
import { RootState } from "redux/store";

export const useFileRepository = () => {
  const dispatch = useDispatch();
  const { files, mostRecentFileid } = useSelector((state: RootState) => state.fileRepository);

  const findById = (fid: string) => files.find((f) => f.fileid === fid)!;

  const mostRecentFile = findById(mostRecentFileid);

  const isMostRecentFile = (f: CorganizeFile) => f.fileid === mostRecentFileid;

  const addFiles = (fs: CorganizeFile[]) => {
    addAll(fs);
    dispatch(add(fs));
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
        dispatch(patch(partialProps));
      });
  };

  const markAsOpened = (fileid: string) => {
    const partialProps: Partial<CorganizeFile> = {
      fileid,
      lastopened: getPosixSeconds(),
      isnewfile: false,
    };

    updateFile(partialProps).then(() => dispatch(setMostRecent(fileid)));
  };

  /**
   * De/activates a file by its fileid.
   *
   * @param fileid ID of the file to de/activate.
   * @returns A boolean value indicating the new activation state along with the emoji representation.
   */
  const toggleFavourite = (fileid: string) => {
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
      emoji: isActivating ? "👍" : "👎",
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
    toggleFavourite,
  };
};