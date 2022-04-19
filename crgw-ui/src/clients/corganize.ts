import { CorganizeFile } from "typedefs/CorganizeFile";
import { SessionInfo } from "typedefs/Session";
import { getPosixSeconds } from "utils/dateUtils";

type FileResponse = {
  metadata: {
    nexttoken?: string;
  };
  files: CorganizeFile[];
};

export type CreateResponse = {
  created: CorganizeFile[];
  skipped: CorganizeFile[];
};

type RawCreateResponse = { created: string[]; skipped: string[] };

class CorganizeClient {
  getFilesBySessionInfo(
    sessionInfo: SessionInfo,
    addFilesToRedux: (files: CorganizeFile[]) => void,
    filterFiles: (files: CorganizeFile[]) => CorganizeFile[]
  ) {
    return this.getFilesWithPagination(
      `/remote/files/${sessionInfo.endpoint}`,
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
    // @ts-ignore
    return fetch("/remote/files/bulk", {
      method: "POST",
      body: JSON.stringify(files),
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
    })
      .then(async (res) => {
        if (res.status === 200) {
          // @ts-ignore
          return res.json() as RawCreateResponse;
        }
        throw new Error("Something went wrong");
      })
      .then(({ created, skipped }: RawCreateResponse) => {
        const findFileById = (fileid: string) => {
          const found = {
            ...files.find((f) => f.fileid === fileid),
            lastupdated: getPosixSeconds(),
            dateactivated: getPosixSeconds(),
          } as CorganizeFile;

          return found;
        };

        return {
          created: created.map(findFileById),
          skipped: skipped.map(findFileById),
        };
      });
  }

  updateFile(file: CorganizeFile): Promise<CorganizeFile> {
    return fetch("/remote/files", {
      method: "PATCH",
      body: JSON.stringify(file),
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
    }).then(() => ({
      ...file,
      lastupdated: getPosixSeconds(),
    }));
  }

  deleteFile(fileid: string): Promise<string> {
    return fetch("/remote/files", {
      method: "DELETE",
      body: JSON.stringify({ fileid }),
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
    }).then(() => fileid);
  }

  getLocalFilenames(): Promise<string[]> {
    // @ts-ignore
    return fetch("/api/files")
      .then((res) => res.json())
      .then(({ files }) => files);
  }

  scrapeAsync(...urls: string[]): Promise<CorganizeFile[]> {
    const dedupFilesById = (files: CorganizeFile[]) =>
      files.filter(
        (v, i, a) => a.findIndex((f) => f.fileid === v.fileid) === i
      );

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
