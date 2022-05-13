import base64
import logging
import os
from os.path import basename
from threading import Thread
from time import sleep
from types import SimpleNamespace
from typing import List, Tuple

from corganizeclient.client import CorganizeClient
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
import requests
from pydash import url as pydash_url

ALLOWED_FWD_HEADERS = ("rangeend", "rangestart", "content-type", "order", "nexttoken", "crg-method", "crg-body")

LOGGER = logging.getLogger(__name__)

_LOCAL_FILE_CACHE = SimpleNamespace(
    files=list(),
    should_run=True,
    running=False,
    crg_client=None
)

DATA_PATH = "/data"
CACHE_UPDATE_INTERVAL = 1800


def get_local_files() -> List[str]:
    return _LOCAL_FILE_CACHE.files


def add_local_files(paths: List[str]):
    LOGGER.info(f"{len(paths)=}")
    LOGGER.info(f"BEFORE {len(_LOCAL_FILE_CACHE.files)=}")
    basenames = [basename(f) for f in paths]  # strip the directory part
    _LOCAL_FILE_CACHE.files = list(set(_LOCAL_FILE_CACHE.files + basenames))
    LOGGER.info(f"AFTER {len(_LOCAL_FILE_CACHE.files)=}")


def split(fileid: str, timerange: Tuple[int, int]) -> dict:
    source_path = os.path.join(DATA_PATH, fileid + ".dec")
    if not os.path.exists(source_path):
        raise FileNotFoundError

    if _LOCAL_FILE_CACHE.crg_client is None:
        host = os.environ["CRG_REMOTE_HOST"]
        apikey = os.environ["CRG_REMOTE_APIKEY"]
        _LOCAL_FILE_CACHE.crg_client = CorganizeClient(host, apikey)

    starttime, endtime = timerange
    new_fileid = f"{fileid}-{starttime}-{endtime}"
    target_path = os.path.join(DATA_PATH, new_fileid + ".dec")

    source_file = _LOCAL_FILE_CACHE.crg_client.get_file(fileid)

    multimedia = source_file.get("multimedia") or dict()
    multimedia.update(dict(duration=endtime - starttime))

    new_file = dict(
        fileid=new_fileid,
        filename=f"{source_file['filename']}-{starttime}-{endtime}",
        sourceurl=source_file["sourceurl"],
        storageservice="local",
        locationref="local",
        mimetype=source_file.get("mimetype"),
        multimedia=multimedia
    )

    _LOCAL_FILE_CACHE.crg_client.create_files([new_file])

    ffmpeg_extract_subclip(source_path, starttime, endtime, targetname=target_path)

    new_file.update(dict(
        size=os.stat(target_path).st_size,
        lastopened=0,
    ))

    _LOCAL_FILE_CACHE.crg_client.update_file(new_file)

    return new_file


def forward_request(data, headers: dict, method: str, subpath: str):
    assert "CRG_REMOTE_HOST" in os.environ
    assert "CRG_REMOTE_APIKEY" in os.environ

    url = pydash_url(os.environ["CRG_REMOTE_HOST"], subpath)
    headers = {k.lower(): v for k, v in headers.items() if k.lower() in ALLOWED_FWD_HEADERS}
    headers["apikey"] = os.environ["CRG_REMOTE_APIKEY"]

    if "crg-method" in headers:
        assert "crg-body" in headers
        method = headers.pop("crg-method")
        headers["Content-Type"] = "application/json"
        data = base64.b64decode(headers.pop("crg-body").encode()).decode().encode('utf-8')

    r = requests.request(url=url, method=method, data=data, headers=headers)
    return r.content, r.status_code, dict(r.headers)


def teardown():
    LOGGER.info("tearing down")
    _LOCAL_FILE_CACHE.should_run = False


def _startup():
    def cache_loop():
        if not os.path.isdir(DATA_PATH):
            LOGGER.warning(f"invalid local path {DATA_PATH=}")
            return

        _LOCAL_FILE_CACHE.running = True
        while _LOCAL_FILE_CACHE.should_run:
            filenames = os.listdir(DATA_PATH)
            _LOCAL_FILE_CACHE.files = filenames
            LOGGER.info(f"Updated cache {len(filenames)=}")
            sleep(CACHE_UPDATE_INTERVAL)

        _LOCAL_FILE_CACHE.running = False
        LOGGER.info("stopped")

    thread = Thread(target=cache_loop)
    thread.start()


_startup()
