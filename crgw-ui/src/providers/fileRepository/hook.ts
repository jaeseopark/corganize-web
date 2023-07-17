import { useContext } from "react";

import { CorganizeFile, getActivationEmoji } from "typedefs/CorganizeFile";
import { Segment } from "typedefs/Segment";
import { SessionInfo } from "typedefs/Session";

import { FileRepository } from "providers/fileRepository/fileRepository";

import { addGlobalTags, populateGlobalTags, retrieveFiles } from "clients/adapter";
import * as client from "clients/corganize";

import { getPosixSeconds } from "utils/dateUtils";

const ONE_DAY = 86400;

const discoveredFileids = new Set<string>();

const discover = (files: CorganizeFile[]) =>
  files.map((f) => f.fileid).forEach(discoveredFileids.add, discoveredFileids);

export const useFileRepository = () => {
  const {
    state: { files, mostRecentFileid },
    dispatch,
  } = useContext(FileRepository);

  const findById = (fid: string) => files.find((f) => f.fileid === fid)!;

  const mostRecentFile = findById(mostRecentFileid);

  const isMostRecentFile = (f: CorganizeFile) => f.fileid === mostRecentFileid;

  const addFiles = (files: CorganizeFile[]) => {
    const undiscoveredFiles = files.filter((f) => !discoveredFileids.has(f.fileid));
    discover(undiscoveredFiles);
    dispatch!({ type: "ADD", payload: undiscoveredFiles });
    return undiscoveredFiles;
  };

  const createScrapedFiles = (files: CorganizeFile[]): Promise<client.CreateResponse> => {
    return client.createFiles(files).then(({ created, skipped }) => {
      discover([...created, ...skipped]);
      return { created, skipped };
    });
  };

  const updateFile = (partialProps: Partial<CorganizeFile>) => {
    if (!partialProps.fileid) {
      return Promise.reject();
    }

    return client.updateFile(partialProps).then(() => {
      if (partialProps.tags) addGlobalTags(partialProps.tags);
      dispatch!({ type: "UPDATE", payload: partialProps });
    });
  };

  const markAsOpened = (fileid: string) => {
    const partialProps: Partial<CorganizeFile> = {
      fileid,
      lastopened: getPosixSeconds(),
      isnewfile: false,
    };

    return updateFile(partialProps).then(() =>
      dispatch!({ type: "SET_MOST_RECENT", payload: fileid })
    );
  };

  const renew = (fileid: string) =>
    updateFile({
      fileid,
      lastopened: 0,
      isnewfile: true,
    });

  /**
   * De/activates a file by its fileid.
   *
   * @param fileid ID of the file to de/activate.
   * @returns A boolean value indicating the new activation state along with the emoji representation.
   */
  const toggleActivation = (fileid: string) => {
    const file = findById(fileid);
    const isActivating = !file.dateactivated;
    const newDateActivated = isActivating ? getPosixSeconds() : 0;

    // Note: Toggling is one use case where the entire file has to be sent to the server.
    const updatePayload = {
      ...file,
      dateactivated: newDateActivated,
    };

    return updateFile(updatePayload).then(() => ({
      activated: isActivating,
      message: isActivating ? "Activated" : "Deactivated",
      emoji: getActivationEmoji(updatePayload),
    }));
  };

  const addPostprocessedFiles = (files: CorganizeFile[]) => {
    files.forEach((newFile) => {
      const ext = newFile.mimetype === "video/mp4" ? "mp4" : "dec";
      newFile.isnewfile = true;
      newFile.streamingurl = `/${newFile.fileid}.${ext}`;
    });
    return addFiles(files);
  };

  const processSegments =
    (func: client.SegmentProcessor) => (fileid: string, segments: Segment[]) =>
      func(fileid, segments).then((files) => {
        addPostprocessedFiles(files);
        dispatch!({ type: "UPDATE", payload: { fileid, dateactivated: undefined } });
      });

  const startSession = (sessionInfo: SessionInfo) => {
    populateGlobalTags();
    retrieveFiles(sessionInfo, addFiles);
  };

  const loadFilesByTag = (tag: string) => retrieveFiles([tag], addFiles);

  const toggleBookmark = (fileid: string) => {
    const file = findById(fileid);
    const isExpired = !file.bookmarkexpiry;
    const newBookmarkExpiry = isExpired ? getPosixSeconds() + ONE_DAY : 0;

    // Note: Toggling is one use case where the entire file has to be sent to the server.
    const updatePayload = {
      ...file,
      bookmarkexpiry: newBookmarkExpiry,
    };

    return updateFile(updatePayload).then(() => newBookmarkExpiry > getPosixSeconds());
  };

  return {
    files,
    isMostRecentFile,
    mostRecentFile,
    startSession,
    loadFilesByTag,
    createScrapedFiles,
    updateFile,
    markAsOpened,
    renew,
    findById,
    toggleActivation,
    postprocesses: {
      cutMerge: processSegments(client.cutMerge),
      cut: processSegments(client.cut),
      reencode: client.reencode,
    },
    toggleSessionBookmark: toggleBookmark
  };
};
