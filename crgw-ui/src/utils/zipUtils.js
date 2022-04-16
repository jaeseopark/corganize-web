import JSZip from "jszip";
import JSZipUtils from "jszip-utils";

export const getObjectUrls = (zipPath) =>
  JSZipUtils.getBinaryContent(zipPath)
    .then((data) => JSZip.loadAsync(data))
    .then(({ files }) => {
      const mediaFiles = Object.entries(files).filter(
        ([name]) => !name.endsWith("/")
      );

      if (!mediaFiles.length) {
        return [];
      }

      return Promise.all(
        mediaFiles.map(([, image]) =>
          image.async("blob").then((blob) => URL.createObjectURL(blob))
        )
      );
    });
