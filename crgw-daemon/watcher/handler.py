import hashlib
import logging
import mimetypes
import os
import shutil

from commmons import get_file_handler, with_prefix
from corganizeclient.client import CorganizeClient


def get_biggest_child(src_path: str, logger: logging.Logger):
    if len(os.listdir(src_path)) == 0:
        logger.info("folder is empty.")
        return None

    logger.debug("Listing all children")

    paths = []
    for root, _, files in os.walk(src_path):
        for file in files:
            paths.append(os.path.join(root, file))

    if len(paths) == 0:
        logger.debug("no children")
        return None

    # Sort children by their sizes
    with_size = [dict(path=p, size=os.stat(p).st_size) for p in paths if os.path.isfile(p)]
    with_size.sort(key=lambda o: o["size"], reverse=True)

    logger.debug(f"{len(with_size)=}")

    # return the biggest child (ie. 1st element in the array)
    if len(with_size) > 0:
        new_path = with_size[0]["path"]
        logger.debug(f"{new_path=}")
        return new_path

    return None


def replace_then_get_new_path(src_path: str, logger: logging.Logger):
    child_path = get_biggest_child(src_path, logger)
    if not child_path:
        logger.warning("cannot determine child's path")
        return None

    _, ext = os.path.splitext(child_path)
    new_path = src_path + ext
    os.rename(child_path, new_path)  # it's okay to use rename() within the same device
    shutil.rmtree(src_path)

    return new_path


def _handle_single_file(src_path: str, data_dir: str, cc: CorganizeClient, original_logger: logging.Logger):
    if os.path.isdir(src_path):
        src_path = replace_then_get_new_path(src_path, original_logger)

    basename = os.path.basename(src_path)
    logger = with_prefix(original_logger, f"{basename=}")
    filename, _ = os.path.splitext(basename)
    fileid = "local" + hashlib.sha256(filename.encode()).hexdigest()
    size = os.stat(src_path).st_size
    guess = mimetypes.guess_type(src_path)[0]  # TODO: use python-magic

    logger = with_prefix(logger, f"{fileid=}")
    logger.info(f"{size=} {guess=}")

    result = cc.create_files([dict(
        fileid=fileid,
        filename=filename,
        sourceurl="local",
        storageservice="local",
        size=size,
    )])

    if len(result["created"]) > 0:
        # Copy the file to the new location
        dst_path = os.path.join(data_dir, f"{fileid}.dec")
        shutil.copyfile(src_path, dst_path)

        # Update the server
        cc.update_file(dict(
            fileid=fileid,
            lastopened=0,
            mimetype=guess or ""
        ))
    else:
        logger.warning("fileid already exists")

    os.remove(src_path)


def handle(src_path: str, config: dict):
    cc = CorganizeClient(**config["server"])
    data_dir = os.path.abspath(config["data"]["path"])

    logger = logging.getLogger(__name__)
    if not logger.hasHandlers():
        logger.setLevel(logging.DEBUG)
        logger.addHandler(logging.StreamHandler())
        logger.addHandler(get_file_handler(os.path.abspath(config["log"]["path"])))

    try:
        _handle_single_file(src_path, data_dir, cc, logger)
    except Exception:
        logger.exception("")
