import logging
import os
import time

from commmons import touch_directory, touch, get_file_handler
from watchdog.events import PatternMatchingEventHandler
from watchdog.observers import Observer

from watcher.handler import handle

logger = logging.getLogger("watcher")
logger.setLevel(logging.DEBUG)


def run_observer_based_watcher(config: dict):
    my_observer = create_observer(config)
    my_observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        my_observer.stop()
        my_observer.join()


def create_observer(config: dict):
    watch_config = config["watch"]
    watchdog_config = watch_config["watchdog"]

    my_event_handler = PatternMatchingEventHandler(patterns=["*"], **watchdog_config["handler"])

    def on_created(event):
        handle(event.src_path, config)

    my_event_handler.on_created = on_created

    my_observer = Observer()
    my_observer.schedule(my_event_handler, watch_config["path"], recursive=watchdog_config["recursive"])

    return my_observer


def run_polling_based_watcher(config: dict):
    watch_config = config["watch"]
    watch_path = os.path.abspath(watch_config["path"])

    while True:
        names = os.listdir(watch_path)
        for name in names:
            src_path = os.path.join(watch_path, name)
            handle(src_path, config)
        time.sleep(watch_config["polling"]["interval"])


def run_watcher(config: dict):
    func = {
        "observer": run_observer_based_watcher,
        "polling": run_polling_based_watcher
    }.get(config["watch"]["type"])

    func(config)


def init_watcher_fs(config: dict):
    touch(config["log"]["watcher"])
    touch_directory(os.path.abspath(config["watch"]["path"]))


def init_watcher_logger(config: dict):
    logger.addHandler(logging.StreamHandler())
    logger.addHandler(get_file_handler(os.path.abspath(config["log"]["watcher"])))
