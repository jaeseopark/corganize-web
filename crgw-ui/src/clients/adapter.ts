import { CorganizeFile } from "typedefs/CorganizeFile";
import { SessionInfo } from "typedefs/Session";
import { Dictionary } from "typedefs/common";

import * as client from "clients/corganize";

import { getPosixSeconds } from "utils/dateUtils";

const NEW_FILE_THRESHOLD = getPosixSeconds() - 5 * 86400; // in the last 5 days

const isnewfile = (lastopened?: number) => {
  if (lastopened) {
    return lastopened < NEW_FILE_THRESHOLD;
  }
  return true; // never opened before
};

const decorate = (localFileIndex: Dictionary<string>) => (f: CorganizeFile) => {
  f.isnewfile = isnewfile(f.lastopened);

  const localFilename = localFileIndex[f.fileid];
  if (localFilename) {
    f.streamingurl = `/${localFilename}`;
    if (f.mimetype === "video/mp4") {
      f.streamingurl = f.streamingurl.replace(".dec", ".mp4");
    }
  }
};

const toIndex = (localFilenames: string[]) =>
  localFilenames.reduce((acc, next) => {
    const [withoutExt] = next.split(".");
    acc[withoutExt] = next;
    return acc;
  }, {} as Dictionary<string>);

export async function retrieveFiles(
  arg: string[] | SessionInfo,
  onLoad: (moreFiles: CorganizeFile[]) => CorganizeFile[]
) {
  let count = 0;

  const localFilenames = await client.getLocalFilenames();
  const localFileIndex = toIndex(localFilenames);

  const callback = (files: CorganizeFile[]) => {
    files.forEach(decorate(localFileIndex));
    const filtered = files.filter((f) => f.streamingurl && f.filename);
    const added = onLoad(filtered);
    count += added.length;
    return added;
  };

  if (Array.isArray(arg)) {
    await client.getFilesByTags(arg as string[], callback);
  } else if (typeof arg === "object") {
    const castedSessionInfo = arg as SessionInfo;
    if (castedSessionInfo.tag) {
      await client.getFilesByTags([castedSessionInfo.tag], callback);
    } else {
      await client.getFilesBySessionInfo(castedSessionInfo, callback);
    }
  }

  return { count };
}

export const globalTags = new Set<string>();
export const addGlobalTags = (tags: string[]) => tags.forEach(globalTags.add, globalTags);
export const populateGlobalTags = () => client.getGlobalTags().then(addGlobalTags);
