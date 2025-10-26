import logging
import os

from corganizeclient.client import CorganizeClient

QUERY_LIMIT = 10000

logger = logging.getLogger("cleaner")


class CorganizeClientWrapper(CorganizeClient):
    def get_recently_deactivated_filenames(self, data_path: str):
        logger.info(f"Fetching recently modified files with limit={QUERY_LIMIT}")
        recent_files = self.get_recently_modified_files(limit=QUERY_LIMIT)
        logger.info(f"Retrieved {len(recent_files)} recent files from API")
        
        inactive_fileids = set([f["fileid"] for f in recent_files if f.get("dateactivated") is None])
        logger.info(f"Found {len(inactive_fileids)} inactive file IDs: {inactive_fileids}")

        def is_inactive(filename: str) -> bool:
            file_id = filename.split(".")[0]
            is_inactive_flag = file_id in inactive_fileids
            return is_inactive_flag

        logger.info(f"Listing local files in data_path={data_path}")
        local_filenames = os.listdir(data_path)
        logger.info(f"Found {len(local_filenames)} local files")
        
        inactive_filenames = [filename for filename in local_filenames if is_inactive(filename)]
        logger.info(f"Filtered to {len(inactive_filenames)} inactive filenames for deletion")
        return inactive_filenames


def cleanup_local_files(data_path: str, cc: CorganizeClientWrapper):
    logger.info(f"Starting cleanup_local_files with data_path={data_path}")
    
    filenames = cc.get_recently_deactivated_filenames(data_path)
    logger.info(f"Retrieved {len(filenames)} files to clean up")

    logger.info("Calculating reclaimed space for each file...")
    reclaimed = []
    for filename in filenames:
        file_path = os.path.join(data_path, filename)
        file_size = os.stat(file_path).st_size
        reclaimed.append(file_size)
        logger.info(f"  {filename}: {file_size} bytes ({file_size / pow(10, 9):.6f} GB)")
    
    reclaimed_gb = sum(reclaimed) / pow(10, 9)
    logger.info(f"Files to delete: {len(filenames)=} {reclaimed_gb=}")
    logger.info(f"Total space to reclaim: {sum(reclaimed)} bytes ({reclaimed_gb:.6f} GB)")

    logger.info(f"Starting deletion of {len(filenames)} files...")
    for i, filename in enumerate(filenames, 1):
        file_path = os.path.join(data_path, filename)
        try:
            logger.info(f"[{i}/{len(filenames)}] Deleting: {file_path}")
            logger.info(f"Delete: {filename}")
            os.remove(file_path)
            logger.info(f"[{i}/{len(filenames)}] Successfully deleted: {filename}")
        except Exception as e:
            logger.error(f"[{i}/{len(filenames)}] Failed to delete {filename}: {e}")
    
    logger.info(f"Cleanup process completed. Deleted {len(filenames)} files.")


def run_local_file_cleaner(config: dict):
    """Run the local file cleanup process."""
    logger.info(f"run_local_file_cleaner started with config keys: {list(config.keys())}")
    
    host = config["server"]["host"]
    apikey = config["server"]["apikey"]
    data_path = config["data"]["path"]
    
    logger.info(f"Configuration extracted: host={host}, data_path={data_path}")
    logger.info(f"API key length: {len(apikey)} characters")
    
    logger.info("Initializing CorganizeClientWrapper...")
    cc = CorganizeClientWrapper(host=host, apikey=apikey)
    logger.info("CorganizeClientWrapper initialized successfully")
    
    logger.info("Starting cleanup process...")
    cleanup_local_files(data_path, cc)
    logger.info("Local file cleaner run completed")
