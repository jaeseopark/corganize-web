import { CorganizeFile } from "typedefs/CorganizeFile";
import { SessionInfo } from "typedefs/Session";
import { getPosixSeconds } from "utils/dateUtils";
import { getInstance } from "clients/corganize";
import { initWithLocalFilenames, getLocalFilename } from "shared/globalstore";

const NEW_FILE_THRESHOLD = getPosixSeconds() - 30 * 86400; // in the last 30 days

const isnewfile = (lastopened?: number) => {
  if (lastopened) {
    return lastopened < NEW_FILE_THRESHOLD;
  }
  return true; // never opened before
};

export const retrieveFiles = (
  sessionInfo: SessionInfo,
  addToFileRepo: (moreFiles: CorganizeFile[]) => void
) => {
  const decorate = (f: CorganizeFile): CorganizeFile => {
    const decorated: CorganizeFile = {
      ...f,
      isnewfile: isnewfile(f.lastopened),
    };

    const localFilename = getLocalFilename(f.fileid);
    if (localFilename) {
      decorated.streamingurl = `/${localFilename}`;
    }

    return decorated;
  };

  const decorateAndFilter = (files: CorganizeFile[]) => {
    files = files.map(decorate);
    if (sessionInfo.showLocalOnly) {
      return files.filter((f: CorganizeFile) => f.streamingurl);
    }
    return files;
  };

  getInstance()
    .getLocalFilenames()
    .then(initWithLocalFilenames)
    .then(() => getInstance().getFilesBySessionInfo(sessionInfo, addToFileRepo, decorateAndFilter));
};
