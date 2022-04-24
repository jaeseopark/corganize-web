import { createSlice } from "@reduxjs/toolkit";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { getPosixSeconds } from "utils/dateUtils";

export type FileRepositoryState = {
  files: CorganizeFile[];
  mostRecentFileid: string;
};

const sanitizeStorageService = (f: Partial<CorganizeFile>) => {
  if (f.storageservice && f.storageservice !== "None") {
    return f;
  }

  const clone = { ...f };
  delete clone.storageservice;
  return clone;
};

const fileRepositorySlice = createSlice({
  name: "counter",
  initialState: {
    files: new Array<CorganizeFile>(),
    mostRecentFileid: "",
  },
  reducers: {
    add: (state, action: { payload: CorganizeFile[] }) => {
      // @ts-ignore
      state.files.push(...action.payload.map(sanitizeStorageService));
    },
    patch: (state, action: { payload: Partial<CorganizeFile> }) => {
      state.files.forEach((f) => {
        if (f.fileid !== action.payload.fileid) {
          return;
        }

        f = sanitizeStorageService(action.payload) as CorganizeFile;
        f.lastupdated = getPosixSeconds();
      });
    },
    setMostRecent: (state, action) => {
      state.mostRecentFileid = action.payload;
    },
  },
});

export const { add, patch, setMostRecent } = fileRepositorySlice.actions;

const fileRepositoryReducer = fileRepositorySlice.reducer;

export default fileRepositoryReducer;
