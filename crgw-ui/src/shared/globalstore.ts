import { CorganizeFile } from "typedefs/CorganizeFile";

const STORE: { map: Map<string, string> | null } = {
  map: null,
};

const addOnePair = (fileid: string, filename: string) => {
  STORE.map!.set(fileid, filename);
};

export const initWithLocalFilenames = (filenames: string[]) => {
  if (STORE.map) {
    throw new Error("Cannot initialize global store twice");
  }

  STORE.map = new Map<string, string>();
  filenames.forEach((filename) => {
    const [withoutExt] = filename.split(".");
    addOnePair(withoutExt, filename);
  });
};

export const addAll = (fs: CorganizeFile[]) =>
  fs.reduce((acc, f) => {
    if (!isDiscovered(f.fileid)) {
      acc.push(f);
      addOnePair(f.fileid, "");
    }
    return acc;
  }, new Array<CorganizeFile>());

export const getLocalFilename = (fileid: string) => STORE.map!.get(fileid);

export const isDiscovered = (fileid: string) => STORE.map!.has(fileid);
