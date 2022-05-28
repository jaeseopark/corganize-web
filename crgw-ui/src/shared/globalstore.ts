import { CorganizeFile } from "typedefs/CorganizeFile";

const STORE = {
  fileMap: new Map<string, string>(),
  tags: new Set<string>(),
};

/* ---------------------------------
 * local file related functions below
 * ---------------------------------
 */

export const getLocalFilename = (fileid: string) => STORE.fileMap!.get(fileid);

export const addOne = (fileid: string, filename: string) => {
  STORE.fileMap!.set(fileid, filename);
};

export const addAll = (files: CorganizeFile[]) => {
  files.forEach((f) => {
    if (!STORE.fileMap!.has(f.fileid)) {
      addOne(f.fileid, "");
    }
  });
};

export const initLocalFilenames = (filenames: string[]) => {
  STORE.fileMap = new Map<string, string>();
  filenames.forEach((filename) => {
    const [withoutExt] = filename.split(".");
    addOne(withoutExt, filename);
  });
};

/* ---------------------------------
 * global tag related functions below
 * ---------------------------------
 */

export const getGlobalTags = () => STORE.tags;

export const addGlobalTags = (tags: string[]) => tags.forEach(STORE.tags.add, STORE.tags);
