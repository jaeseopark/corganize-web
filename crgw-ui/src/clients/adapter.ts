import { CorganizeFile } from "typedefs/CorganizeFile";
import { SessionInfo } from "typedefs/Session";

import client from "clients/corganize";

import { getPosixSeconds } from "utils/dateUtils";

const NEW_FILE_THRESHOLD = getPosixSeconds() - 14 * 86400; // in the last 14 days

const isnewfile = (lastopened?: number) => {
  if (lastopened) {
    return lastopened < NEW_FILE_THRESHOLD;
  }
  return true; // never opened before
};

const decorate = (localFileIndex: { [key: string]: string }) => (f: CorganizeFile) => {
  f.isnewfile = isnewfile(f.lastopened);

  const localFilename = localFileIndex[f.fileid];
  if (localFilename) {
    f.streamingurl = `/${localFilename}`;
  }
};

const toIndex = (localFilenames: string[]) =>
  localFilenames.reduce((acc, next) => {
    const [withoutExt] = next.split(".");
    acc[withoutExt] = next;
    return acc;
  }, {} as { [key: string]: string });

export async function retrieveFiles(
  arg: string[] | SessionInfo,
  onLoad: (moreFiles: CorganizeFile[]) => CorganizeFile[]
) {
  const localFilenames = await client.getLocalFilenames();
  const localFileIndex = toIndex(localFilenames);

  const callback = (files: CorganizeFile[]) => {
    files.forEach(decorate(localFileIndex));
    const filtered = files.filter((f) => f.streamingurl);
    return onLoad(filtered);
  };

  if (Array.isArray(arg)) {
    client.getFilesByTags(arg as string[], callback);
  } else if (typeof arg === "object") {
    client.getFilesBySessionInfo(arg as SessionInfo, callback);
  }
}

export const globalTags = new Set<string>();
export const addGlobalTags = (tags: string[]) => tags.forEach(globalTags.add, globalTags);
export const populateGlobalTags = () => client.getGlobalTags().then(addGlobalTags);
