import { CorganizeFile } from "typedefs/CorganizeFile";
import { Segment } from "typedefs/Segment";
import { SessionInfo } from "typedefs/Session";

import { chunk } from "utils/arrayUtils";
import { getPosixSeconds } from "utils/dateUtils";

type FileResponse = {
  metadata: {
    nexttoken?: string;
  };
  files: CorganizeFile[];
};

const CREATE_FILE_CHUNK_SIZE = 10;
const POST_SCRAPE_DEDUP_CHUNK_SIZE = 50;

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

const proxyFetch = (url: string, method: "POST" | "PATCH", data: object) => {
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

class CorganizeClient {
  getFilesBySessionInfo(sessionInfo: SessionInfo, callback: RetrievalCallback) {
    const params = {} as { [key: string]: string };
    if (sessionInfo.minSize) {
      params.minsize = String(sessionInfo.minSize);
    }

    return this.getFilesWithPagination(
      `/api/remote/files/${sessionInfo.endpoint}`,
      params,
      sessionInfo.limit,
      callback
    );
  }

  getFilesByTags(tags: string[], callback: (files: CorganizeFile[]) => CorganizeFile[]) {
    return this.getFilesWithPagination(
      "/api/remote/files",
      { tags: tags.join("|") },
      99999,
      callback
    );
  }

  _getFiles(path: string, params: { [key: string]: string }, nexttoken?: string) {
    const clone = { ...params };
    if (nexttoken) {
      clone.nexttoken = nexttoken;
    }
    return fetch(path + "?" + new URLSearchParams(clone), { mode: "cors" }).then((r) => {
      // @ts-ignore
      return r.json() as FileResponse;
    });
  }

  getFilesWithPagination(
    path: string,
    params: { [key: string]: string },
    remaining: number,
    callback: RetrievalCallback,
    paginationToken?: string
  ): Promise<null> {
    if (remaining <= 0) return Promise.resolve(null);

    return this._getFiles(path, params, paginationToken)
      .then(({ metadata, files }) => ({ metadata, files: callback(files) }))
      .then(({ metadata, files }: FileResponse) => {
        const nexttoken = metadata?.nexttoken;
        if (!nexttoken) return null;

        return this.getFilesWithPagination(
          path,
          params,
          remaining - files.length,
          callback,
          nexttoken
        );
      });
  }

  createFiles(files: CorganizeFile[]): Promise<CreateResponse> {
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
  }

  updateFile(partialProps: Partial<CorganizeFile>): Promise<Partial<CorganizeFile>> {
    return proxyFetch("/api/remote/files", "PATCH", partialProps).then((response) => {
      if (response.status !== 200) {
        throw new Error(`status ${response.status}`);
      }
      return {
        ...partialProps,
        lastupdated: getPosixSeconds(),
      };
    });
  }

  getLocalFilenames(): Promise<string[]> {
    // @ts-ignore
    return fetch("/api/files")
      .then((res) => res.json())
      .then(({ files }) => files);
  }

  getGlobalTags(): Promise<string[]> {
    return fetch("/api/remote/tags")
      .then((res) => res.json())
      .then(({ tags }) => tags);
  }

  scrapeAsync(
    ...urls: string[]
  ): Promise<{ available: CorganizeFile[]; discarded: CorganizeFile[] }> {
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
      fetch("/redir/scrape", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      })
        .then((res) => res.json())
        .then(({ files }: { files: CorganizeFile[] }) =>
          files.map((f) => ({ ...f, storageservice: "None" }))
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
  }

  trim(fileid: string, segments: Segment[]): Promise<CorganizeFile[]> {
    const url = `/api/files/${fileid}/trim`;
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
  }

  cut(fileid: string, segments: Segment[]): Promise<CorganizeFile[]> {
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
  }
}

const instance = new CorganizeClient();

export default instance;
