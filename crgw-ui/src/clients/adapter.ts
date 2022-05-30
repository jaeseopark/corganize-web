import { CorganizeFile } from "typedefs/CorganizeFile";
import { SessionInfo } from "typedefs/Session";

import { getInstance } from "clients/corganize";

import { addGlobalTags, getLocalFilename, initLocalFilenames } from "shared/globalstore";

import { getPosixSeconds } from "utils/dateUtils";

const NEW_FILE_THRESHOLD = getPosixSeconds() - 30 * 86400; // in the last 30 days

const isnewfile = (lastopened?: number) => {
  if (lastopened) {
    return lastopened < NEW_FILE_THRESHOLD;
  }
  return true; // never opened before
};

export const retrieveFiles = async (
  sessionInfo: SessionInfo,
  addToRedux: (moreFiles: CorganizeFile[]) => void
) => {
  const decorate = (f: CorganizeFile) => {
    f.isnewfile = isnewfile(f.lastopened);

    const localFilename = getLocalFilename(f.fileid);
    if (localFilename) {
      f.streamingurl = `/${localFilename}`;
    }
  };

  const decorateAndFilter = (files: CorganizeFile[]) => {
    files.forEach(decorate);
    if (sessionInfo.showLocalOnly) {
      return files.filter((f: CorganizeFile) => f.streamingurl);
    }
    return files;
  };

  const client = getInstance();
  const tags = await client.getTags();
  const localFilenames = await client.getLocalFilenames();

  addGlobalTags(tags);
  initLocalFilenames(localFilenames);

  client.getFilesBySessionInfo(sessionInfo, addToRedux, decorateAndFilter);
};
