import logging
import os
from os.path import basename
import shutil
from threading import Thread
from time import sleep
from types import SimpleNamespace
from typing import List

LOGGER = logging.getLogger("crgw-api")

_LOCAL_FILE_CACHE = SimpleNamespace(
    files=list(),
    should_run=True,
    running=False,
)

DATA_PATH = "/data"
CACHE_UPDATE_INTERVAL = 1800


def get_local_files() -> List[str]:
    return _LOCAL_FILE_CACHE.files


def get_remaining_space() -> int:
    """
    Remaining disk space in bytes
    """
    return shutil.disk_usage(DATA_PATH)[2]


def add_local_files(paths: List[str]):
    LOGGER.info(f"{len(paths)=}")
    LOGGER.info(f"BEFORE {len(_LOCAL_FILE_CACHE.files)=}")
    basenames = [basename(f) for f in paths]  # strip the directory part
    _LOCAL_FILE_CACHE.files = list(set(_LOCAL_FILE_CACHE.files + basenames))
    LOGGER.info(f"AFTER {len(_LOCAL_FILE_CACHE.files)=}")


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
            filenames = [f for f in os.listdir(DATA_PATH) if f.endswith("dec")]
            _LOCAL_FILE_CACHE.files = filenames
            LOGGER.info(f"Updated cache {len(filenames)=}")
            sleep(CACHE_UPDATE_INTERVAL)

        _LOCAL_FILE_CACHE.running = False
        LOGGER.info("stopped")

    thread = Thread(target=cache_loop)
    thread.start()


_startup()
