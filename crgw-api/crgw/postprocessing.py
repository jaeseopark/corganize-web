import logging
import mimetypes
import os
from typing import List, Tuple, Callable

from commmons import now_seconds, md5, merge
from corganizeclient.client import CorganizeClient
from moviepy.config import get_setting as get_moviepy_setting
from moviepy.tools import subprocess_call
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip

DATA_PATH = "/data"
DEFAULT_EXT = ".mp4"
TRIMID_LENGTH = 6

LOGGER = logging.getLogger("crgw-api")


def normalize_segments(segments: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
    if len(segments) == 0:
        raise ValueError("Need one or more segments for processing")

    for start, end in segments:
        if start >= end:
            raise ValueError("Negative duration")

    # TODO sort segmens and merge overlaps

    return segments


def cut_clip(fileid: str, segments: List[Tuple[int, int]]) -> List[dict]:
    segments = normalize_segments(segments)

    new_files = list()
    for start, end in segments:
        def ffmpeg_subclip(new_file: dict, source_path: str, target_path: str):
            mimetype = new_file.get("mimetype")
            ext_with_dot = mimetypes.guess_extension(mimetype) if mimetype else DEFAULT_EXT
            tmp_path = target_path + ext_with_dot
            ffmpeg_extract_subclip(source_path, start, end, targetname=tmp_path)
            os.rename(tmp_path, target_path)

        new_file = _process(fileid, suffix=f"-{start}-{end}", new_duration=end - start, process=ffmpeg_subclip)
        new_files.append(new_file)

    return new_files


def trim_clip(fileid: str, segments: List[Tuple[int, int]]) -> dict:
    segments = normalize_segments(segments)
    duration = sum([end - start for start, end in segments])

    def get_command(source_path: str, target_path: str) -> List[str]:
        # Credit: https://superuser.com/a/1621363
        cmd: List[str] = [get_moviepy_setting("FFMPEG_BINARY"), "-y", ]
        for start, end in segments:
            cmd += ["-ss", str(start), "-to", str(end), "-i", source_path]

        tracks = "".join([f"[{i}:v][{i}:a]" for i in range(len(segments))])
        filter_describer = f"{tracks}concat=n={len(segments)}:v=1:a=1[outv][outa]"

        cmd += [
            "-filter_complex", filter_describer,
            "-map", "[outv]",
            "-map", "[outa]",
            target_path
        ]

        return cmd

    def ffmpeg_filter_trim(new_file: dict, source_path: str, target_path: str):
        mimetype = new_file.get("mimetype")
        ext_with_dot = mimetypes.guess_extension(mimetype) if mimetype else DEFAULT_EXT
        tmp_path = target_path + ext_with_dot

        cmd = get_command(source_path, target_path=tmp_path)
        LOGGER.info(f"{' '.join(cmd)=}")

        subprocess_call(cmd)
        os.rename(tmp_path, target_path)

    suffix = f"-trim-{md5(str(segments))[:TRIMID_LENGTH]}"
    return _process(fileid, suffix=suffix, new_duration=duration, process=ffmpeg_filter_trim)


def _process(fileid: str,
             suffix: str,
             new_duration: int,
             process: Callable[[dict, str, str], None]) -> dict:
    source_path = os.path.join(DATA_PATH, fileid + ".dec")
    if not os.path.exists(source_path):
        message = f"file not found: {source_path=}"
        LOGGER.info(message)
        raise FileNotFoundError(message)

    crg_client = CorganizeClient(os.environ["CRG_REMOTE_HOST"], os.environ["CRG_REMOTE_APIKEY"])
    source_file = crg_client.get_file(fileid)

    mimetype = source_file.get("mimetype")
    multimedia = source_file.get("multimedia") or dict()
    if "highlights" in multimedia:
        multimedia.pop("highlights")

    new_fileid = fileid + suffix
    target_path = os.path.join(DATA_PATH, new_fileid + ".dec")
    new_file = dict(
        fileid=new_fileid,
        filename=source_file["filename"] + suffix,
        sourceurl=source_file["sourceurl"],
        storageservice="local",
        locationref="local",
        mimetype=mimetype,
        multimedia=merge(multimedia, dict(duration=new_duration)),
        dateactivated=now_seconds(),
        lastopened=0,
    )

    process(new_file, source_path, target_path)

    new_file.update(dict(
        size=os.stat(target_path).st_size,
    ))

    crg_client.create_files([new_file])
    return new_file
