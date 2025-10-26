import time
import logging

import requests

TAG_COUNT_CHUNK_SIZE = 100

logger = logging.getLogger("cleaner")


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


def run_tag_cleaner(config: dict):
    """Run the tag cleanup process."""
    host = config["server"]["host"]
    apikey = config["server"]["apikey"]
    cleanup_unused_tags(host, apikey)
