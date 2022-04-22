import React, { Dispatch, useEffect, useReducer, useState } from "react";
import { retrieveFiles } from "clients/adapter";
import SessionConfigurer from "components/standalone/SessionConfigurer";
import { addAll } from "shared/globalstore";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { SessionInfo } from "typedefs/Session";
import { getPosixSeconds } from "utils/dateUtils";

type State = {
  files: CorganizeFile[];
  mostRecentFileid: string;
};

type Action =
  | { type: "ADD"; payload: CorganizeFile[] }
  | { type: "UPDATE"; payload: CorganizeFile }
  | { type: "SET_MOST_RECENT"; payload: string };

const initialState: State = {
  files: [],
  mostRecentFileid: "",
};

export const FileRepository = React.createContext<{
  state: State;
  dispatch?: Dispatch<Action>;
  addFiles?: (fs: CorganizeFile[]) => void;
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
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>();
  const [state, dispatch] = useReducer(fileReducer, initialState);

  const addFiles = (fs: CorganizeFile[]) => {
    addAll(fs);
    dispatch({ type: "ADD", payload: fs });
  };

  useEffect(() => {
    if (sessionInfo) {
      retrieveFiles(sessionInfo!, addFiles);
    }
  }, [sessionInfo]);

  if (!sessionInfo) {
    return <SessionConfigurer setInfo={setSessionInfo} />;
  }

  const value = {
    state,
    dispatch,
    addFiles,
  };

  return <FileRepository.Provider value={value}>{children}</FileRepository.Provider>;
};

export default FileRepositoryProvider;
