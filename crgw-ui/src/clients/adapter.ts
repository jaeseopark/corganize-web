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
  const decorate = (f: CorganizeFile): CorganizeFile => {
    const decorated: CorganizeFile = {
      ...f,
      isnewfile: isnewfile(f.lastopened),
    };
    decorated.filename = decorated.filename || decorated.fileid;

    const localFilename = getLocalFilename(f.fileid);
    if (localFilename) {
      decorated.streamingurl = `/${localFilename}`;
    }

    return decorated;
  };

  const decorateAndFilter = (files: CorganizeFile[]) => {
    files = files.map(decorate).filter((f) => f.size === undefined || f.size > sessionInfo.minSize);
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
