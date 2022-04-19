import { CorganizeFile } from "typedefs/CorganizeFile";

export const FILE_MARKED_AS_NEW = "Marked as new again";

export const FILE_UPDATED = "Metadata updated";

export const DOWNLOAD_COMPLETE = "Download complete ✔️";

export const FILEID_TOO_LONG = "'fileid' too long (>128)";

export const FILE_NOT_STORED_ANYWHERE = "Not stored anywhere";

export const COPIED_TO_CLIPBOARD = "Source URL copied to clipboard";

export const DOWNLOAD_IN_PROGRESS = "Download still in progress";

export const favAsEmoji = (file: CorganizeFile) =>
  file.dateactivated ? "👍" : "👎";

export const favToggleMessage = (file: CorganizeFile) => {
  const emoji = favAsEmoji(file);
  const pastTense = file.dateactivated ? "Favourited" : "Unfavourited";
  return `${pastTense} ${emoji}`;
};
