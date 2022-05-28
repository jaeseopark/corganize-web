import { CorganizeFile } from "typedefs/CorganizeFile";

const STORE: { fileMap: Map<string, string> | null; tags: Set<string> } = {
  fileMap: null,
  tags: new Set(),
};

export const addOne = (fileid: string, filename: string) => {
  STORE.fileMap!.set(fileid, filename);
};

export const initWithLocalFilenames = (filenames: string[]) => {
  if (STORE.fileMap) {
    throw new Error("Cannot initialize global store twice");
  }

  STORE.fileMap = new Map<string, string>();
  filenames.forEach((filename) => {
    const [withoutExt] = filename.split(".");
    addOne(withoutExt, filename);
  });
};

export const getLocalFilename = (fileid: string) => STORE.fileMap!.get(fileid);

const isDiscovered = (fileid: string) => STORE.fileMap!.has(fileid);

export const addAll = (fs: CorganizeFile[]) =>
  fs.reduce((acc, f) => {
    if (!isDiscovered(f.fileid)) {
      acc.push(f);
      addOne(f.fileid, "");
    }
    return acc;
  }, new Array<CorganizeFile>());

export const getGlobalTags = () => STORE.tags;

export const addGlobalTags = (tags: string[]) => tags.forEach(STORE.tags.add, STORE.tags);
