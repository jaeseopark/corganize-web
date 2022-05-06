import logging
import os
import sys
from dataclasses import dataclass, field
from typing import List, Callable, Generator

import requests
from commmons import touch, get_file_handler, sample_size
from corganizeclient.client import CorganizeClient

logger = logging.getLogger("scraper")


@dataclass
class ScrapableEntry:
    url: str
    max_items: int = field(default=sys.maxsize)

    def scrape(self, external_scrape_func: Callable[[str], List[dict]]) -> Generator[dict]:
        files = external_scrape_func(self.url)
        yield from [i for i in sample_size(files, self.max_items)]


def run_scraper(config: dict):
    cc = CorganizeClient(**config["server"])
    recent_files = cc.get_active_files(limit=config["scrape"]["quick_dedup"]["query_limit"], interval=15)
    recent_fileids = [f["fileid"] for f in recent_files]
    banned_keywords: List[str] = [n.lower() for n in config["scrape"]["blacklist"]]

    def filt(files: Generator[dict]) -> Generator[dict]:
        for file in files:
            if file["fileid"] in recent_fileids:
                continue

            # TODO: use regex instead
            if any([bkw in file["filename"].lower() for bkw in banned_keywords]):
                continue

            yield file

    def call_remote(url: str) -> List[dict]:
        host_url = "http://localhost/redir/scrape"
        r = requests.post(host_url, json=dict(url=url))

        if not r.ok:
            logger.error(r.text)

        return r.json()["files"]

    def scrape():
        for e in config["scrape"]["entries"]:
            entry = ScrapableEntry(**e)
            yield from entry.scrape(call_remote)

    unfiltered = scrape()
    filtered = filt(unfiltered)

    result = cc.create_files(list(filtered))
    logger.info(f"{result['created']=} {result['skipped']=} {result['failed']=}")


def init_scraper(config: dict):
    touch(config["log"]["scraper"])
    logger.setLevel(logging.DEBUG)
    logger.addHandler(logging.StreamHandler())
    logger.addHandler(get_file_handler(os.path.abspath(config["log"]["scraper"])))
