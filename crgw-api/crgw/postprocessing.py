import logging
import os
from typing import List, Tuple, Callable, Optional

from commmons import now_seconds, md5, merge
from corganizeclient.client import CorganizeClient
from moviepy.config import get_setting as get_moviepy_setting
from moviepy.tools import subprocess_call

from crgw.local_filesystem import add_local_files

DATA_PATH = "/data"
TRIM_ID_LENGTH = 6
DEFAULT_CRF = 25
MAX_RESOLUTION = 1080  # short side

LOGGER = logging.getLogger("crgw-api")


def get_crg_client():
    return CorganizeClient(os.environ["CRG_REMOTE_HOST"], os.environ["CRG_REMOTE_APIKEY"])


def get_file(fileid: str) -> dict:
    return get_crg_client().get_file(fileid)


def _subclip(source_path, target_path, start, end):
    tmp_path = target_path + ".mp4"
    subprocess_call([
        get_moviepy_setting("FFMPEG_BINARY"), "-y",
        "-ss", "%0.2f" % start,
        "-i", source_path,
        "-t", "%0.2f" % (end - start),
        "-map", "0",
        "-async", "1",
        "-avoid_negative_ts", "make_zero",
        "-c", "copy",
        tmp_path
    ])
    os.rename(tmp_path, target_path)


def _process(source_file: dict,
             suffix: str,
             process: Callable[[str, str], None],
             new_duration: int = None) -> dict:
    fileid = source_file["fileid"]
    source_path = os.path.join(DATA_PATH, fileid + ".dec")
    if not os.path.exists(source_path):
        message = f"file not found: {source_path=}"
        LOGGER.info(message)
        raise FileNotFoundError(message)

    crg_client = get_crg_client()

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
        mimetype="video/mp4",
        dateactivated=now_seconds(),
        lastopened=0,
    )

    if new_duration:
        new_file.update(dict(
            multimedia=merge(multimedia, dict(duration=new_duration)),
        ))

    if source_file.get("tags"):
        new_file.update(dict(
            tags=source_file.get("tags")
        ))

    process(source_path, target_path)

    new_file.update(dict(
        size=os.stat(target_path).st_size,
    ))

    crg_client.create_files([new_file])
    add_local_files([target_path])

    crg_client.update_file(dict(
        fileid=fileid,
        dateactivated=None
    ))

    return new_file


def intersects(s1: Tuple[int, int], s2: Tuple[int, int]) -> bool:
    s1_end = s1[1]
    s2_start, s2_end = s2
    assert s1_end <= s2_end
    return s2_start <= s1_end


def combine_segments(s1: Tuple[int, int], s2: Tuple[int, int]):
    s1_start, s1_end = s1
    s2_start, s2_end = s2
    all_timestamps = (s1_start, s1_end, s2_start, s2_end)
    return min(all_timestamps), max(all_timestamps)


def normalize_segments(segments: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
    assert segments, "Need one or more segments for processing"

    for start, end in segments:
        assert start < end, "segment must have a positive duration"

    segments.sort(key=lambda s: s[1])  # sort by end timestamps
    len_segments = len(segments)
    for i in range(len_segments - 1, 0, -1):
        segment = segments[i]
        prev_segment = segments[i - 1]
        if intersects(prev_segment, segment):
            segments[i - 1] = combine_segments(prev_segment, segment)
            segments = segments[:i] + segments[i + 1:]

    return segments


def cut_individually(fileid: str, segments: List[Tuple[int, int]]) -> List[dict]:
    """
    Splits the video into N files, where N = len(normalize_segments(segments)).
    The original file gets deactivated when the processing is successfully finished.
    """
    segments = normalize_segments(segments)
    source_file = get_file(fileid)

    new_files = list()
    for start, end in segments:
        def ffmpeg_subclip(source_path: str, target_path: str):
            _subclip(source_path, target_path, start, end)

        new_file = _process(source_file, suffix=f"-{start}-{end}", new_duration=end - start, process=ffmpeg_subclip)
        new_files.append(new_file)

    return new_files


def cut_merge(fileid: str, segments: List[Tuple[int, int]]) -> dict:
    """
    Composes a new video by stitching the given segments.
    The original file gets deactivated when the processing is successfully finished.
    """
    segments = normalize_segments(segments)
    duration = sum([end - start for start, end in segments])
    trim_id = md5(str(segments))[:TRIM_ID_LENGTH]
    source_file = get_file(fileid)

    def ffmpeg_filter_trim(source_path: str, target_path: str):
        concat_specs_path = f"/tmp/{trim_id}.sources"
        tmp_path = target_path + ".mp4"

        segment_paths = list()
        for i, (start, end) in enumerate(segments):
            segment_path = f"{target_path}-{i}.mp4"
            _subclip(source_path, segment_path, start, end)
            segment_paths.append(segment_path)

        os.makedirs("/tmp", exist_ok=True)
        with open(concat_specs_path, "w") as fp:
            fp.write("\n".join([f"file '{p}'" for p in segment_paths]))

        subprocess_call([
            get_moviepy_setting("FFMPEG_BINARY"), "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_specs_path,
            "-c", "copy",
            tmp_path
        ])
        os.rename(tmp_path, target_path)

        # Cleanup temporary files...
        os.remove(concat_specs_path)
        for segment_path in segment_paths:
            os.remove(segment_path)

    suffix = f"-trim-{trim_id}"
    return _process(source_file, suffix=suffix, new_duration=duration, process=ffmpeg_filter_trim)


def reencode(fileid: str, crf: int = None) -> dict:
    """
    The original file gets deactivated when the processing is successfully finished.
    """

    source_file = get_file(fileid)

    def get_resize_scale() -> int:
        width = source_file.get("multimedia", {}).get("width")
        height = source_file.get("multimedia", {}).get("height")

        if width and height:
            return MAX_RESOLUTION / min(width, height)

        return 0

    def ffmpeg_reencode(source_path: str, target_path: str):
        additional_args = []

        resize_scale = get_resize_scale()
        if resize_scale > 1:
            additional_args += ["-vf", f"scale=iw*{resize_scale}:-1"]

        tmp_path = target_path + ".mp4"
        args = [
            get_moviepy_setting("FFMPEG_BINARY"), "-y",
            "-i", source_path,
            "-crf", str(crf) if crf else str(DEFAULT_CRF),
        ]
        subprocess_call(args + additional_args + [tmp_path])
        os.rename(tmp_path, target_path)

    return _process(source_file, suffix="-reencode", process=ffmpeg_reencode)
