import logging
import os

import requests

from commmons import init_logger_with_handlers
from corganizeclient.client import CorganizeClient

QUERY_LIMIT = 10000

logger = logging.getLogger("cleaner")


class CorganizeClientWrapper(CorganizeClient):
    def get_recently_deactivated_filenames(self, data_path: str):
        recent_files = self.get_recently_modified_files(limit=QUERY_LIMIT)
        inactive_fileids = set([f["fileid"] for f in recent_files if f.get("dateactivated") is None])

        def is_inactive(filename: str) -> bool:
            return filename.split(".")[0] in inactive_fileids

        local_filenames = os.listdir(data_path)
        return [filename for filename in local_filenames if is_inactive(filename)]


def cleanup_local_files(data_path: str, cc: CorganizeClientWrapper):
    filenames = cc.get_recently_deactivated_filenames(data_path)

    reclaimed = [os.stat(os.path.join(data_path, filename)).st_size for filename in filenames]
    reclaimed_gb = sum(reclaimed) / pow(10, 9)

    logger.info(f"Files to delete: {len(filenames)=} {reclaimed_gb=}")

    for filename in filenames:
        logger.info(f"Delete: {filename}")
        os.remove(os.path.join(data_path, filename))


def run_cleaner(config: dict):
    host = config["server"]["host"]
    apikey = config["server"]["apikey"]

    cc = CorganizeClientWrapper(host=host, apikey=apikey)
    cleanup_local_files(config["data"]["path"], cc)
    
    r = requests.post(f"{host}/files/cleanup", headers=dict(apikey=apikey))
    logger.info(f"file cleanup {r.status_code=} {r.text=}")

    r = requests.post(f"{host}/tags/cleanup", headers=dict(apikey=apikey))
    logger.info(f"tag cleanup {r.status_code=} {r.text=}")


def init_cleaner(config: dict):
    os.makedirs(config["data"]["path"], exist_ok=True)
    init_logger_with_handlers("cleaner", logging.DEBUG, config["log"]["cleaner"])
