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
  getFilesBySessionInfo(
    sessionInfo: SessionInfo,
    addFilesToRedux: (files: CorganizeFile[]) => void,
    filterFiles: (files: CorganizeFile[]) => CorganizeFile[]
  ) {
    return this.getFilesWithPagination(
      `/api/remote/files/${sessionInfo.endpoint}`,
      sessionInfo,
      sessionInfo.limit,
      addFilesToRedux,
      filterFiles
    );
  }

  getFiles(path: string, sessionInfo: SessionInfo, nexttoken?: string) {
    const params: { [key: string]: string } = {};

    if (nexttoken) {
      params.nexttoken = nexttoken;
    }

    if (sessionInfo.minSize) {
      params.minsize = String(sessionInfo.minSize);
    }

    // TODO: sessionInfo.mimetypes

    return fetch(path + "?" + new URLSearchParams(params), { mode: "cors" });
  }

  getFilesWithPagination(
    path: string,
    sessionInfo: SessionInfo,
    remaining: number,
    addFilesToRedux: (files: CorganizeFile[]) => void,
    filterFiles: (files: CorganizeFile[]) => CorganizeFile[],
    paginationToken?: string
  ): Promise<null> {
    if (remaining <= 0) return Promise.resolve(null);

    return this.getFiles(path, sessionInfo, paginationToken)
      .then((r) => {
        // @ts-ignore
        return r.json() as FileResponse;
      })
      .then(({ metadata, files }) => {
        return { metadata, files: filterFiles(files || []) };
      })
      .then(({ metadata: { nexttoken }, files }: FileResponse) => {
        addFilesToRedux(files);

        if (!nexttoken) return null;

        return this.getFilesWithPagination(
          path,
          sessionInfo,
          remaining - files.length,
          addFilesToRedux,
          filterFiles,
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

  getTags(): Promise<string[]> {
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

let instance: CorganizeClient;
export const getInstance = () => {
  if (!instance) {
    instance = new CorganizeClient();
  }
  return instance;
};
