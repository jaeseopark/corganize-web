import mimetypes
import os
from typing import List, Tuple, Callable

from commmons import merge, now_seconds
from corganizeclient.client import CorganizeClient
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip

DATA_PATH = "/data"
DEFAULT_EXT = ".mp4"


def create_subclip(fileid: str, timerange: Tuple[int, int]) -> dict:
    source_path = os.path.join(DATA_PATH, fileid + ".dec")
    if not os.path.exists(source_path):
        raise FileNotFoundError

    crg_client = CorganizeClient(os.environ["CRG_REMOTE_HOST"], os.environ["CRG_REMOTE_APIKEY"])

    starttime, endtime = timerange
    if starttime >= endtime:
        raise ValueError("Negative duration")
    new_fileid = f"{fileid}-{starttime}-{endtime}"
    target_path = os.path.join(DATA_PATH, new_fileid + ".dec")

    def _execute(mimetype: str):
        ext_with_dot = mimetypes.guess_extension(mimetype) if mimetype else DEFAULT_EXT
        tmp_path = target_path + ext_with_dot
        ffmpeg_extract_subclip(source_path, starttime, endtime, targetname=tmp_path)
        os.rename(tmp_path, target_path)

    new_file = _create_subclip(fileid, new_fileid, starttime, endtime, crg_client, _execute)
    new_file.update(dict(
        size=os.stat(target_path).st_size,
        lastopened=0,
    ))

    crg_client.update_file(new_file)

    return new_file


def _create_subclip(fileid, new_fileid, starttime, endtime, crg_client, execute: Callable[[str], None]):
    source_file = crg_client.get_file(fileid)

    mimetype = source_file.get("mimetype")
    multimedia = merge(
        source_file.get("multimedia") or dict(),
        dict(duration=endtime - starttime)
    )
    if "highlights" in multimedia:
        multimedia.pop("highlights")

    new_file = dict(
        fileid=new_fileid,
        filename=f"{source_file['filename']}-{starttime}-{endtime}",
        sourceurl=source_file["sourceurl"],
        storageservice="local",
        locationref="local",
        mimetype=mimetype,
        multimedia=multimedia,
        dateactivated=now_seconds()
    )
    crg_client.create_files([new_file])

    execute(mimetype)

    return new_file


def trim_clip(fileid: str, segments: List[dict]) -> dict:
    pass
