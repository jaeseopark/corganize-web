import logging
from typing import Iterable

import requests
from commmons import init_logger_with_handlers
from corganizeclient.client import CorganizeClient
from pydash import chunk

CHUNK_SIZE = 100
logger = logging.getLogger("scraper")


def run_scraper(config: dict):
    cc = CorganizeClient(**config["server"])
    recent_files = cc.get_active_files(limit=config["scrape"]["quick_dedup"]["query_limit"])
    recent_fileids = set([f["fileid"] for f in recent_files])

    def filt(files: Iterable[dict]) -> Iterable[dict]:
        for file in files:
            if file["fileid"] in recent_fileids:
                continue

            yield file

    def scrape() -> Iterable[dict]:
        for entry in config["scrape"]["entries"]:
            r = requests.post("http://api/scrape", json=entry)

            if not r.ok:
                logger.error(r.text)
                continue

            files = r.json()["files"]
            logger.info(f"{entry['url']=} {len(files)=}")

            yield from [f for f in files]

    unfiltered = scrape()
    filtered = filt(unfiltered)

    for i, page in enumerate(chunk(list(filtered), CHUNK_SIZE)):
        result = cc.create_files(list(page))
        logger.info(f"{i=} {len(result['created'])=} {len(result['skipped'])=}")


def init_scraper(config: dict):
    init_logger_with_handlers("scraper", logging.DEBUG, config["log"]["scraper"])
