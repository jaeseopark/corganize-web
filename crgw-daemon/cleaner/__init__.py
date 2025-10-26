import logging
import os

from commmons import init_logger_with_handlers


def init_cleaner(config: dict):
    os.makedirs(config["data"]["path"], exist_ok=True)
    init_logger_with_handlers("cleaner", logging.DEBUG, config["log"]["cleaner"])
