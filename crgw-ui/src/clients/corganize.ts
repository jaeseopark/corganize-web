import { CorganizeFile } from "typedefs/CorganizeFile";
import { SessionInfo } from "typedefs/Session";

import { chunk } from "utils/arrayUtils";
import { getPosixSeconds } from "utils/dateUtils";

type FileResponse = {
  metadata: {
    nexttoken?: string;
  };
  files: CorganizeFile[];
};

const CHUNK_SIZE = 10;

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

  getFiles(path: string, info: SessionInfo, nexttoken?: string) {
    const headers = {
      rangestart: info.dateRangeStart,
      rangeend: info.dateRangeEnd,
    };

    if (nexttoken) {
      // @ts-ignore
      headers.nexttoken = nexttoken;
    }

    // @ts-ignore
    return fetch(path, { headers, mode: "cors" });
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

    const promises = chunk(files, CHUNK_SIZE).map((thisChunk) =>
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

  scrapeAsync(...urls: string[]): Promise<CorganizeFile[]> {
    const dedupFilesById = (files: CorganizeFile[]) =>
      files.filter((v, i, a) => a.findIndex((f) => f.fileid === v.fileid) === i);

    const scrapeSingleUrl = (url: string) =>
      fetch("/scrape", {
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
      .then(dedupFilesById);
  }
}

let instance: CorganizeClient;
export const getInstance = () => {
  if (!instance) {
    instance = new CorganizeClient();
  }
  return instance;
};
