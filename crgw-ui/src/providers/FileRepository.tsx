import React, { useContext, useEffect, useReducer, useState } from "react";
import { retrieveFiles } from "clients/adapter";
import { CreateResponse, getInstance } from "clients/corganize";
import SessionConfigurer from "components/standalone/SessionConfigurer";
import { addAll } from "shared/globalstore";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { SessionInfo } from "typedefs/Session";
import { getPosixSeconds } from "utils/dateUtils";
import { didChange } from "utils/objectUtils";

type State = {
  files: CorganizeFile[];
  mostRecentFileid: string;
  searchKeyword: string;
};

type Action =
  | { type: "ADD"; payload: CorganizeFile[] }
  | { type: "UPDATE"; payload: CorganizeFile }
  | { type: "SET_MOST_RECENT"; payload: string };

const initialState: State = {
  files: [],
  mostRecentFileid: "",
  searchKeyword: "",
};

const FileRepository = React.createContext<{
  state: State;
  createThenAddFiles: (fs: CorganizeFile[]) => Promise<CreateResponse>;
  updateFile: (f: CorganizeFile) => Promise<CorganizeFile>;
  markAsOpened: (fid: string) => void;
  findById: (fid: string) => CorganizeFile;
  toggleFavourite: (fid: string) => void;
}>({
  state: initialState,
  createThenAddFiles: (fs) => ({} as Promise<CreateResponse>),
  updateFile: (f) => Promise.resolve(f),
  markAsOpened: (fid) => null,
  findById: (fid) => ({} as CorganizeFile),
  toggleFavourite: (fid) => null,
});

const sanitizeStorageService = (f: CorganizeFile) => {
  if (f.storageservice && f.storageservice !== "None") {
    return f;
  }

  const clone = { ...f };
  delete clone.storageservice;
  return clone;
};

const fileReducer = (
  { files, mostRecentFileid, searchKeyword }: State,
  action: Action
): State => {
  switch (action.type) {
    case "ADD":
      return {
        files: [
          ...files,
          ...action.payload.map((f) => sanitizeStorageService(f)),
        ],
        mostRecentFileid,
        searchKeyword,
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
        searchKeyword,
      };
    case "SET_MOST_RECENT":
      return {
        files,
        mostRecentFileid: action.payload,
        searchKeyword,
      };
    default:
      return { files, mostRecentFileid, searchKeyword };
  }
};

const FileRepositoryProvider = ({ children }: { children: JSX.Element }) => {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>();
  const [state, dispatch] = useReducer(fileReducer, initialState);

  const findById = (fid: string): CorganizeFile =>
    state.files.find((f) => f.fileid === fid) as CorganizeFile;

  const addFiles = (fs: CorganizeFile[]) => {
    const undiscovered = addAll(fs);
    dispatch({ type: "ADD", payload: undiscovered });
  };

  const createThenAddFiles = (fs: CorganizeFile[]): Promise<CreateResponse> => {
    return getInstance()
      .createFiles(fs)
      .then(({ created, skipped }) => {
        addFiles([...created, ...skipped]);
        return { created, skipped };
      });
  };

  const updateFile = (newFile: CorganizeFile): Promise<CorganizeFile> => {
    const file = findById(newFile.fileid);
    if (didChange(file, newFile)) {
      // TODO: update remote server first
      return new Promise((resolve) => {
        dispatch({ type: "UPDATE", payload: newFile });
        resolve(newFile);
      });
    }
    return Promise.reject();
  };

  const markAsOpened = (fid: string) => {
    const file = findById(fid);
    dispatch({
      type: "UPDATE",
      payload: {
        ...file,
        lastopened: getPosixSeconds(),
        isNewFile: false,
      },
    });
    dispatch({ type: "SET_MOST_RECENT", payload: fid });
  };

  const toggleFavourite = (fid: string) => {
    const file = findById(fid);
    dispatch({
      type: "UPDATE",
      payload: {
        ...file,
        dateactivated: !file.dateactivated ? getPosixSeconds() : 0,
      },
    });
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
    createThenAddFiles,
    updateFile,
    markAsOpened,
    findById,
    toggleFavourite,
  };

  return (
    <FileRepository.Provider value={value}>{children}</FileRepository.Provider>
  );
};

export const useFileRepository = () => {
  const {
    state: { files, mostRecentFileid, searchKeyword },
    ...rest
  } = useContext(FileRepository);

  return {
    files,
    mostRecentFileid,
    searchKeyword,
    ...rest,
  };
};

export default FileRepositoryProvider;
