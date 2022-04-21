import cls from "classnames";

import { CorganizeFile } from "typedefs/CorganizeFile";
import { useFileRepository } from "hooks/useFileRepository";
import { favAsEmoji } from "utils/userpromptUtils";
import { toHumanDuration, toHumanFileSize } from "utils/numberUtils";
import { getVideoMetadata } from "utils/multimediaUtils";

import "./FileSummary.scss";

const VideoIcons = ({ file }: { file: CorganizeFile }) => {
  const videoMetadata = getVideoMetadata(file);

  if (!videoMetadata) return null;

  const {
    isVertical: vertical,
    resolution,
    bitrate,
    highlights,
  } = videoMetadata;
  const ortCls = cls("icon", "orientation", { vertical });

  return (
    <>
      {highlights && <span className="tag highlights">⭐</span>}
      <span className="tag duration">
        {toHumanDuration(file.multimedia?.duration as number)}
      </span>
      {resolution && <span className="tag resolution">{resolution}</span>}
      <span className="tag bitrate">{bitrate}</span>
      <span className={ortCls} />
    </>
  );
};

const ZipIcons = ({ file }: { file: CorganizeFile }) => {
  if (!file.multimedia) return null;
  const {
    multimedia: { filecount, highlights },
  } = file;
  return (
    <>
      {highlights && <span className="tag">⭐</span>}
      {filecount && (
        <span className="tag">{file.multimedia?.filecount}pcs</span>
      )}
    </>
  );
};

const maybeRenderMultimediaIcons = (file: CorganizeFile) => {
  if (file.mimetype) {
    if (file.mimetype.includes("video")) {
      return (
        <div className="tags">
          <VideoIcons file={file} />
        </div>
      );
    }
    if (file.mimetype.includes("zip")) {
      return (
        <div className="tags">
          <ZipIcons file={file} />
        </div>
      );
    }
  }

  return null;
};

type FileSummaryProps = {
  fileid: string;
  withSize?: boolean;
  withFav?: boolean;
  withStorage?: boolean;
};

const FileSummary = ({
  fileid,
  withSize,
  withFav,
  withStorage,
}: FileSummaryProps) => {
  const { findById } = useFileRepository();

  const file = findById(fileid);
  const { filename, storageservice } = file;

  const maybeRenderFavTag = () => {
    if (!withFav) return null;
    return <div className="tag">{favAsEmoji(file)}</div>;
  };

  const maybeRenderStorageIcon = () => {
    if (!withStorage || !storageservice) return null;
    const divCls = cls("storageservice", "tag", "icon", storageservice);
    return <div className={divCls} />;
  };

  const maybeRenderSizeTag = () => {
    const { size } = file;
    if (!withSize || !size) return null;
    return <span className="tag">{`${toHumanFileSize(size as number)}`}</span>;
  };

  return (
    <div className="file-summary">
      {maybeRenderFavTag()}
      {maybeRenderStorageIcon()}
      {maybeRenderSizeTag()}
      {maybeRenderMultimediaIcons(file)}
      <span>{filename}</span>
    </div>
  );
};

FileSummary.defaultProps = {
  withSize: false,
  withFav: false,
  withStorage: false,
};

export default FileSummary;
