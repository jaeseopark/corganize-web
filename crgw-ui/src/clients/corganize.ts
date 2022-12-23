import { CorganizeFile } from "typedefs/CorganizeFile";
import { Segment } from "typedefs/Segment";
import { SessionInfo } from "typedefs/Session";
import { Dictionary } from "typedefs/common";

import { chunk } from "utils/arrayUtils";
import { getPosixSeconds } from "utils/dateUtils";

const CREATE_FILE_CHUNK_SIZE = 10;
const POST_SCRAPE_DEDUP_CHUNK_SIZE = 50;
const DELETE_TAGS_CHUNK_SIZE = 30;

type FileResponse = {
  metadata: {
    nexttoken?: string;
  };
  files: CorganizeFile[];
};

export type SegmentProcessor = (fileid: string, segments: Segment[]) => Promise<CorganizeFile[]>;

export type CreateResponse = {
  created: CorganizeFile[];
  skipped: CorganizeFile[];
};

type RawCreateResponse = { created: string[]; skipped: string[] };
type RetrievalCallback = (files: CorganizeFile[]) => CorganizeFile[];

function b64EncodeUnicode(str: string) {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

const proxyFetch = (url: string, method: "POST" | "PATCH" | "DELETE", data: object) => {
  const headers = {
    "crg-method": method,
    "crg-body": b64EncodeUnicode(JSON.stringify(data)),
  };
  return fetch(url, {
    mode: "cors",
    method: "GET",
    headers,
  });
};

const segmentsToTuples = (segments: Segment[]) => segments.map((s) => [s.start, s.end]);

const getFilesById = (fileIds: string[]) => {
  const chunks = chunk(fileIds, POST_SCRAPE_DEDUP_CHUNK_SIZE);

  const getByChunk = (fileIds: string[]) => {
    const params = new URLSearchParams({ fileIds: fileIds.join("|") });
    return fetch("/api/remote/files?" + params)
      .then((r) => r.json())
      .then(({ files }) => files);
  };

  return Promise.allSettled(chunks.map((aChunk) => getByChunk(aChunk))).then((results) =>
    results.reduce((acc, result) => {
      if (result.status === "fulfilled") {
        acc.push(...result.value);
      }
      return acc;
    }, new Array<CorganizeFile>())
  );
};

export const getFilesBySessionInfo = (sessionInfo: SessionInfo, callback: RetrievalCallback) => {
  const params = {} as Dictionary<string>;
  if (sessionInfo.minSize) {
    params.minsize = String(sessionInfo.minSize);
  }

  const npg = nextPageGetter(`/api/remote/files/${sessionInfo.endpoint}`, params, callback);

  return getFilesWithPagination(npg, sessionInfo.limit);
};

export const getFilesByTags = (
  tags: string[],
  callback: (files: CorganizeFile[]) => CorganizeFile[]
) => {
  const npg = nextPageGetter("/api/remote/files", { tags: tags.join("|") }, callback);
  return getFilesWithPagination(npg, 99999);
};

const nextPageGetter = (path: string, params: Dictionary<string>, callback: RetrievalCallback) => {
  return async (nexttoken?: string): Promise<FileResponse> => {
    const clone = { ...params };
    if (nexttoken) {
      clone.nexttoken = nexttoken;
    }
    const finalPath = path + "?" + new URLSearchParams(clone);

    const res = await fetch(finalPath, { mode: "cors" });
    const { metadata, files } = await res.json();
    return { metadata: metadata || {}, files: callback(files) };
  };
};

export const getFilesWithPagination = async (
  getNextPage: (token?: string) => Promise<FileResponse>,
  remaining: number,
  paginationToken?: string
): Promise<void> => {
  if (remaining <= 0) return;

  const {
    metadata: { nexttoken },
    files,
  } = await getNextPage(paginationToken);

  if (!nexttoken) return;

  return getFilesWithPagination(getNextPage, remaining - files.length, nexttoken);
};

export const createFiles = (files: CorganizeFile[]): Promise<CreateResponse> => {
  const findFileById = (fileid: string) =>
  ({
    ...files.find((f) => f.fileid === fileid),
    lastupdated: getPosixSeconds(),
    dateactivated: getPosixSeconds(),
  } as CorganizeFile);

  const promises = chunk(files, CREATE_FILE_CHUNK_SIZE).map((thisChunk) =>
    proxyFetch("/api/remote/files", "POST", thisChunk)
      .then(async (res) => {
        if (res.status === 200) {
          // @ts-ignore
          return res.json() as RawCreateResponse;
        }
        throw new Error(`status ${res.status}`);
      })
      .then(({ created, skipped }: RawCreateResponse) => {
        return {
          created: created.map(findFileById),
          skipped: skipped.map(findFileById),
        };
      })
  );

  return Promise.all(promises).then((responses) =>
    responses.reduce(
      (acc, next) => {
        return {
          created: [...acc.created, ...next.created],
          skipped: [...acc.skipped, ...next.skipped],
        };
      },
      { created: [], skipped: [] } as CreateResponse
    )
  );
};

export const updateFile = (
  partialProps: Partial<CorganizeFile>
): Promise<Partial<CorganizeFile>> => {
  return proxyFetch("/api/remote/files", "PATCH", partialProps).then((response) => {
    if (response.status !== 200) {
      throw new Error(`status ${response.status}`);
    }
    return {
      ...partialProps,
      lastupdated: getPosixSeconds(),
    };
  });
};

export const getLocalFilenames = (): Promise<string[]> => {
  // @ts-ignore
  return fetch("/api/files")
    .then((res) => res.json())
    .then(({ files }) => files);
};

export const getGlobalTags = (): Promise<string[]> =>
  fetch("/api/remote/tags")
    .then((res) => res.json())
    .then(({ tags }) => tags);

export const deleteTags = (tags: string[]) => {
  const chunks = chunk(tags, DELETE_TAGS_CHUNK_SIZE);
  return Promise.all(
    chunks.map((aChunk) => proxyFetch("/api/remote/tags", "DELETE", { tags: aChunk }))
  );
};

export const scrapeAsync = (
  ...urls: string[]
): Promise<{ available: CorganizeFile[]; discarded: CorganizeFile[] }> => {
  const dedupFilesById = (files: CorganizeFile[]) =>
    files.filter((v, i, a) => a.findIndex((f) => f.fileid === v.fileid) === i);

  const dedupAgainstDatabase = (files: CorganizeFile[]) =>
    getFilesById(files.map((f) => f.fileid))
      .then((files) => new Set((files as CorganizeFile[]).map((f) => f.fileid)))
      .then((fileIds) => ({
        available: files.filter((f) => !fileIds.has(f.fileid)),
        discarded: files.filter((f) => fileIds.has(f.fileid)),
      }));

  const scrapeSingleUrl = (url: string) =>
    fetch("/api/scrape", {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({ files }: { files: CorganizeFile[] }) =>
        files.filter((f) => f.filename).map((f) => ({ ...f, storageservice: "None" }))
      );

  return Promise.allSettled(urls.map((url) => scrapeSingleUrl(url)))
    .then((results) =>
      results.reduce((acc, result) => {
        if (result.status === "fulfilled") {
          acc.push(...result.value);
        }
        return acc;
      }, new Array<CorganizeFile>())
    )
    .then(dedupFilesById)
    .then(dedupAgainstDatabase);
};

export const cutMerge: SegmentProcessor = (fileid, segments) => {
  const url = `/api/files/${fileid}/cut-merge`;
  return fetch(url, {
    method: "POST",
    body: JSON.stringify({ segments: segmentsToTuples(segments) }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (res) => {
      if (res.status === 200) {
        return res.json();
      }

      throw new Error(await res.text());
    })
    .then((f) => {
      // The return type of the endpoint is CorganizeFile.
      // Wrap it in an array to align with the function signature.
      return [f];
    });
};

export const cut: SegmentProcessor = (fileid, segments) => {
  const url = `/api/files/${fileid}/cut`;
  return fetch(url, {
    method: "POST",
    body: JSON.stringify({ segments: segmentsToTuples(segments) }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(async (res) => {
    if (res.status === 200) {
      return res.json();
    }

    throw new Error(await res.text());
  });
};

export const reencode = ({ fileid, crf, maxres, dimensions }: { fileid: string, crf: number, maxres: number, dimensions?: number[] }): Promise<void> => {
  const url = `/api/files/${fileid}/reencode`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ crf, maxres, dimensions })
  }).then(async (res) => {
    if (res.status === 201) {
      return;
    }

    throw new Error(await res.text());
  });
};

export const getRemainingSpace = (): Promise<number> =>
  fetch("/api/info")
    .then((res) => res.json())
    .then(({ remainingSpace }) => remainingSpace);

export const getReport = (reportName: "tags") =>
  fetch(`/api/remote/reports/${reportName}`).then((res) => res.json());

export const backup = () =>
  proxyFetch("/api/remote/backup", "POST", {}).then(({ status }) => {
    if (status !== 200) {
      throw new Error(`status ${status}`);
    }
  });
