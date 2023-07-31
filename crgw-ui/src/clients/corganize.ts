import { CorganizeFile } from "typedefs/CorganizeFile";
import { Segment } from "typedefs/Segment";
import { SessionInfo } from "typedefs/Session";
import { Dictionary } from "typedefs/common";

import { chunk } from "utils/arrayUtils";
import { getPosixSeconds } from "utils/dateUtils";

const CREATE_FILE_CHUNK_SIZE = 10;
const POST_SCRAPE_DEDUP_CHUNK_SIZE = 50;

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

const fetchWithCreds = (url: RequestInfo, init?: RequestInit) => {
  return fetch(url, {
    ...init,
    credentials: "same-origin",
  });
};

const proxyFetch = (
  url: RequestInfo,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  data: object = {},
  init?: RequestInit
) => {
  let headers = {
    "crg-method": method,
    "crg-body": b64EncodeUnicode(JSON.stringify(data)),
  };
  return fetchWithCreds(url, {
    ...init,
    mode: "cors",
    method: "GET",
    headers: { ...headers, ...init?.headers },
  });
};

const segmentsToTuples = (segments: Segment[]) => segments.map((s) => [s.start, s.end]);

const getFilesById = (fileIds: string[]) => {
  const chunks = chunk(fileIds, POST_SCRAPE_DEDUP_CHUNK_SIZE);

  const getByChunk = (fileIds: string[]) => {
    const params = new URLSearchParams({ fileIds: fileIds.join("|") });
    return fetchWithCreds("/api/remote/files?" + params)
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

export const getFilesByTagsWithoutPagination = (tags: string[]) => {
  const files: CorganizeFile[] = [];

  const npg = nextPageGetter("/api/remote/files", { tags: tags.join("|") }, (moreFiles) => {
    files.push(...moreFiles);
    return moreFiles;
  });
  return getFilesWithPagination(npg, 99999).then(() => files);
};

const nextPageGetter = (path: string, params: Dictionary<string>, callback: RetrievalCallback) => {
  return async (nexttoken?: string): Promise<FileResponse> => {
    const clone = { ...params };
    if (nexttoken) {
      clone.nexttoken = nexttoken;
    }
    const finalPath = path + "?" + new URLSearchParams(clone);

    const res = await fetchWithCreds(finalPath, { mode: "cors" });
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
  return fetchWithCreds("/api/files")
    .then((res) => res.json())
    .then(({ files }) => files);
};

export const getGlobalTags = (): Promise<string[]> =>
  fetchWithCreds("/api/remote/tags")
    .then((res) => res.json())
    .then(({ tags }) => tags);

const postprocessScarpePromise = (promise: Promise<CorganizeFile[]>): Promise<{ available: CorganizeFile[]; discarded: CorganizeFile[] }> => {
  const ignoreFilesWithoutNames = (files: CorganizeFile[]): CorganizeFile[] => files.filter(f => f.filename);

  const populateMissingFields = (files: CorganizeFile[]): CorganizeFile[] => files.map(f => ({ ...f, storageservice: "None" }));

  const dedupFilesById = (files: CorganizeFile[]) =>
    files.filter((v, i, a) => a.findIndex((f) => f.fileid === v.fileid) === i);

  const dedupAgainstDatabase = (files: CorganizeFile[]) =>
    getFilesById(files.map((f) => f.fileid))
      .then((files) => new Set((files as CorganizeFile[]).map((f) => f.fileid)))
      .then((fileIds) => ({
        available: files.filter((f) => !fileIds.has(f.fileid)),
        discarded: files.filter((f) => fileIds.has(f.fileid)),
      }));

  return promise
    .then(ignoreFilesWithoutNames)
    .then(populateMissingFields)
    .then(dedupFilesById)
    .then(dedupAgainstDatabase);
};

export const scrapeAsync = (
  ...urls: string[]
) => {
  const scrapeSingleUrl = (url: string) =>
    fetchWithCreds("/api/scrape", {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())

  const selttled = Promise.allSettled(urls.map((url) => scrapeSingleUrl(url)))
    .then((results) =>
      results.reduce((acc, result) => {
        if (result.status === "fulfilled") {
          acc.push(...result.value);
        }
        return acc;
      }, new Array<CorganizeFile>())
    )

  return postprocessScarpePromise(selttled);
}

export const scrapeHtmlAsync = (html: string) => {
  const promise = fetchWithCreds("/api/scrape", {
    method: "POST",
    body: JSON.stringify({ html }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json());

  return postprocessScarpePromise(promise);
}

export const scrapeLiteralUrlsAsync = (urls: string[]): Promise<CorganizeFile[]> =>
  fetchWithCreds("/api/scrape/literal", {
    method: "POST",
    body: JSON.stringify({ urls }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((json) => json.files);

export const cutMerge: SegmentProcessor = (fileid, segments) => {
  const url = `/api/files/${fileid}/cut-merge`;
  return fetchWithCreds(url, {
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
  return fetchWithCreds(url, {
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

export const reencode = ({
  fileid,
  crf,
  maxres,
  dimensions,
}: {
  fileid: string;
  crf: number;
  maxres: number;
  dimensions?: number[];
}): Promise<void> => {
  const url = `/api/files/${fileid}/reencode`;
  return fetchWithCreds(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ crf, maxres, dimensions }),
  }).then(async (res) => {
    if (res.status === 201) {
      return;
    }

    throw new Error(await res.text());
  });
};

export const getRemainingSpace = (): Promise<number> =>
  fetchWithCreds("/api/info")
    .then((res) => res.json())
    .then(({ remainingSpace }) => remainingSpace);

export const backup = () =>
  proxyFetch("/api/remote/backup", "POST", {}).then(({ status }) => {
    if (status !== 200) {
      throw new Error(`status ${status}`);
    }
  });

export const getIncompleteFileCount = () =>
  proxyFetch("/api/remote/files/incomplete")
    .then((res) => res.json())
    .then(({ files, metadata }: FileResponse) => ({
      count: files.length,
      isExhausted: !!metadata.nexttoken,
    }));

export const login = (bearerToken: string) =>
  fetchWithCreds("/api/remote/login", {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });
