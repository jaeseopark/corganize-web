import logging
import os
from threading import Thread
from time import sleep
from types import SimpleNamespace
from typing import List

from crgw.config import get_config

LOGGER = logging.getLogger(__name__)

_LOCAL_FILE_CACHE = SimpleNamespace(
    files=list(),
    should_run=True,
    running=False,
)


def get_local_files() -> List[str]:
    return _LOCAL_FILE_CACHE.files


def teardown():
    LOGGER.info("tearing down")
    _LOCAL_FILE_CACHE.should_run = False


def _startup():
    def cache_loop():
        path = get_config()["local"]["path"]
        sleep_seconds = get_config()["local"]["sleep_seconds"]

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
