import base64
import logging
import os
from os.path import basename
from threading import Thread
from time import sleep
from types import SimpleNamespace
from typing import List

import requests
from pydash import url as pydash_url

ALLOWED_FWD_HEADERS = ("rangeend", "rangestart", "content-type", "order", "nexttoken", "crg-method", "crg-body")

LOGGER = logging.getLogger(__name__)

_LOCAL_FILE_CACHE = SimpleNamespace(
    files=list(),
    should_run=True,
    running=False,
)


def get_local_files() -> List[str]:
    return _LOCAL_FILE_CACHE.files


def add_local_files(paths: List[str]):
    basenames = [basename(f) for f in paths]  # strip the directory part
    _LOCAL_FILE_CACHE.files = list(set(_LOCAL_FILE_CACHE.files + basenames))


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
    path = "/data"
    sleep_seconds = 1800

    def cache_loop():
        if not os.path.isdir(path):
            LOGGER.warning(f"invalid local path {path=}")
            return

        _LOCAL_FILE_CACHE.running = True
        while _LOCAL_FILE_CACHE.should_run:
            filenames = os.listdir(path)
            _LOCAL_FILE_CACHE.files = filenames
            LOGGER.info(f"Updated cache {len(filenames)=}")
            sleep(sleep_seconds)

        _LOCAL_FILE_CACHE.running = False
        LOGGER.info("stopped")

    thread = Thread(target=cache_loop)
    thread.start()


_startup()
