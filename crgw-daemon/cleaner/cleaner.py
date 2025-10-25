from time import time
import logging
import os

import requests

from commmons import init_logger_with_handlers
from corganizeclient.client import CorganizeClient

QUERY_LIMIT = 10000
TAG_COUNT_CHUNK_SIZE = 100

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


def cleanup_unused_tags(host: str, apikey: str):
    """Get all tags, find ones with 0 usage, and delete them."""
    headers = dict(apikey=apikey)
    
    # Get all tags
    r = requests.get(f"{host}/tags", headers=headers)
    if r.status_code != 200:
        logger.error(f"Failed to get tags: {r.status_code=} {r.text=}")
        return
    
    tags = r.json().get("tags", [])
    logger.info(f"Found {len(tags)=} total tags")
    
    if not tags:
        logger.info("No tags to cleanup")
        return
    
    # Process tags in chunks of 100
    total_deleted = 0
    
    for i in range(0, len(tags), TAG_COUNT_CHUNK_SIZE):
        chunk = tags[i:i + TAG_COUNT_CHUNK_SIZE]
        chunk_index = i // TAG_COUNT_CHUNK_SIZE
        tags_str = "|".join(chunk)
        
        # Get count for this chunk
        r = requests.get(
            f"{host}/tags/count",
            headers=headers,
            params=dict(tags=tags_str)
        )
        
        if r.status_code != 200:
            logger.error(f"Failed to get tag counts: {r.status_code=} {r.text=}")
            break
        
        # Filter out zero counts and find tags with 0 usage
        tag_counts = r.json()
        tag_counts = {tag: count for tag, count in tag_counts.items() if count > 0}

        # Identify unused tags
        used_tags = set(tag_counts.keys())
        unused_tags = [tag for tag in chunk if tag not in used_tags]

        logger.info(f"Chunk {chunk_index}: checked {len(chunk)} tags, found {len(unused_tags)} unused")

        if unused_tags:
            # Delete unused tags for this chunk
            r = requests.delete(
                f"{host}/tags",
                headers=headers,
                json=dict(tags=unused_tags)
            )
        
            if r.status_code == 200:
                logger.info(f"Successfully deleted {len(unused_tags)} unused tags from chunk {chunk_index}")
                total_deleted += len(unused_tags)
            else:
                logger.error(f"Failed to delete tags from chunk {chunk_index}: {r.status_code=} {r.text=}")

        time.sleep(3)  # Sleep to avoid overwhelming the server

    logger.info(f"Tag cleanup complete, deleted {total_deleted} total unused tags")


def run_cleaner(config: dict):
    host = config["server"]["host"]
    apikey = config["server"]["apikey"]

    # Clean up unused tags first
    cleanup_unused_tags(host, apikey)

    # Clean up local files (deactivated)
    cc = CorganizeClientWrapper(host=host, apikey=apikey)
    cleanup_local_files(config["data"]["path"], cc)


def init_cleaner(config: dict):
    os.makedirs(config["data"]["path"], exist_ok=True)
    init_logger_with_handlers("cleaner", logging.DEBUG, config["log"]["cleaner"])
