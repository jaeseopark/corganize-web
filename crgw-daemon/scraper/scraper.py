import logging
import os
from typing import Iterable

import requests
from commmons import touch, get_file_handler
from corganizeclient.client import CorganizeClient

logger = logging.getLogger("scraper")


def run_scraper(config: dict):
    cc = CorganizeClient(**config["server"])
    recent_files = cc.get_active_files(limit=config["scrape"]["quick_dedup"]["query_limit"], interval=15)
    recent_fileids = set([f["fileid"] for f in recent_files])
    banned_keywords = set([n.lower() for n in config["scrape"]["blacklist"]])

    def filt(files: Iterable[dict]) -> Iterable[dict]:
        for file in files:
            if file["fileid"] in recent_fileids:
                continue

            # TODO: use regex instead
            if any([s in file["filename"].lower() for s in banned_keywords]):
                continue

            yield file

    def scrape() -> Iterable[dict]:
        for entry in config["scrape"]["entries"]:
            host_url = "http://localhost/redir/scrape"
            r = requests.post(host_url, json=entry)

            if not r.ok:
                logger.error(r.text)
                continue

            yield from [f for f in r.json()["files"]]

    unfiltered = scrape()
    filtered = filt(unfiltered)

    result = cc.create_files(list(filtered))
    logger.info(f"{result['created']=} {result['skipped']=} {result['failed']=}")


def init_scraper(config: dict):
    touch(config["log"]["scraper"])
    logger.setLevel(logging.DEBUG)
    logger.addHandler(logging.StreamHandler())
    logger.addHandler(get_file_handler(os.path.abspath(config["log"]["scraper"])))
