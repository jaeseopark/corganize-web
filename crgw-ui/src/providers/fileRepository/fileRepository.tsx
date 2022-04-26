import React, { Dispatch, useReducer } from "react";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { getPosixSeconds } from "utils/dateUtils";

type State = {
  files: CorganizeFile[];
  mostRecentFileid: string;
};

type Action =
  | { type: "ADD"; payload: CorganizeFile[] }
  | { type: "UPDATE"; payload: Partial<CorganizeFile> }
  | { type: "SET_MOST_RECENT"; payload: string };

const initialState: State = {
  files: [],
  mostRecentFileid: "",
};

export const FileRepository = React.createContext<{
  state: State;
  dispatch?: Dispatch<Action>;
}>({
  state: initialState,
});

const sanitizeStorageService = (f: CorganizeFile) => {
  if (f.storageservice && f.storageservice !== "None") {
    return f;
  }

  const clone = { ...f };
  delete clone.storageservice;
  return clone;
};

const fileReducer = ({ files, mostRecentFileid }: State, action: Action): State => {
  switch (action.type) {
    case "ADD":
      return {
        files: [...files, ...action.payload.map((f) => sanitizeStorageService(f))],
        mostRecentFileid,
      };
    case "UPDATE":
      return {
        files: files.map((f) => {
          if (f.fileid !== action.payload.fileid) {
            return f;
          }
          return sanitizeStorageService({
            ...f,
            ...action.payload,
            lastupdated: getPosixSeconds(),
          });
        }),
        mostRecentFileid,
      };
    case "SET_MOST_RECENT":
      return {
        files,
        mostRecentFileid: action.payload,
      };
    default:
      return { files, mostRecentFileid };
  }
};

const FileRepositoryProvider = ({ children }: { children: JSX.Element }) => {
  const [state, dispatch] = useReducer(fileReducer, initialState);

  const value = {
    state,
    dispatch,
  };

  return <FileRepository.Provider value={value}>{children}</FileRepository.Provider>;
};

export default FileRepositoryProvider;
