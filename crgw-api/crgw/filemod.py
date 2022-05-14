import mimetypes
import os
from typing import List, Tuple, Callable

from commmons import merge, now_seconds
from corganizeclient.client import CorganizeClient
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip

DATA_PATH = "/data"
DEFAULT_EXT = ".mp4"


def create_subclip(fileid: str, timerange: Tuple[int, int]) -> dict:
    start, end = timerange
    if start >= end:
        raise ValueError("Negative duration")

    def _callback(new_file: dict, source_path: str, target_path: str):
        mimetype = new_file.get("mimetype")
        ext_with_dot = mimetypes.guess_extension(mimetype) if mimetype else DEFAULT_EXT
        tmp_path = target_path + ext_with_dot
        ffmpeg_extract_subclip(source_path, start, end, targetname=tmp_path)
        os.rename(tmp_path, target_path)

    def _decorate_new_file(new_file: dict) -> dict:
        multimedia = new_file.get("multimedia", dict())
        multimedia["duration"] = end - start
        new_file["filename"] = f"{new_file['filename']}-{start}-{end}"
        new_file["multimedia"] = multimedia
        return new_file

    new_fileid = f"{fileid}-{start}-{end}"
    return _process(fileid, new_fileid, decorate_new_file=_decorate_new_file, callback=_callback)


def trim_clip(fileid: str, segments: List[dict]) -> dict:
    if len(segments) == 0:
        raise ValueError("Provide more than zero segments")


def _process(fileid: str,
             new_fileid: str,
             decorate_new_file: Callable[[dict], dict],
             callback: Callable[[dict, str, str], None]) -> dict:
    crg_client = CorganizeClient(os.environ["CRG_REMOTE_HOST"], os.environ["CRG_REMOTE_APIKEY"])

    source_path = os.path.join(DATA_PATH, fileid + ".dec")
    if not os.path.exists(source_path):
        raise FileNotFoundError

    source_file = crg_client.get_file(fileid)

    mimetype = source_file.get("mimetype")
    multimedia = source_file.get("multimedia") or dict()
    if "highlights" in multimedia:
        multimedia.pop("highlights")

    new_file = decorate_new_file(dict(
        fileid=new_fileid,
        filename=source_file["filename"],
        sourceurl=source_file["sourceurl"],
        storageservice="local",
        locationref="local",
        mimetype=mimetype,
        multimedia=multimedia,
        dateactivated=now_seconds()
    ))
    crg_client.create_files([new_file])

    target_path = os.path.join(DATA_PATH, new_fileid + ".dec")
    callback(new_file, source_path, target_path)
    new_file.update(dict(
        size=os.stat(target_path).st_size,
        lastopened=0,
    ))

    crg_client.update_file(new_file)
    return new_file
