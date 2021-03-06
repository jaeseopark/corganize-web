import logging
import os
import time

from commmons import init_logger_with_handlers
from watchdog.events import PatternMatchingEventHandler
from watchdog.observers import Observer

from watcher.handler import handle

logger = logging.getLogger("watcher")
logger.setLevel(logging.DEBUG)


def _create_observer(config: dict):
    watch_config = config["watch"]
    watchdog_config = watch_config["watchdog"]

    my_event_handler = PatternMatchingEventHandler(patterns=["*"], **watchdog_config["handler"])

    def on_created(event):
        handle(event.src_path, config)

    my_event_handler.on_created = on_created

    my_observer = Observer()
    my_observer.schedule(my_event_handler, watch_config["path"], recursive=watchdog_config["recursive"])

    return my_observer


def run_observer_based_watcher(config: dict):
    my_observer = _create_observer(config)
    my_observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        my_observer.stop()
        my_observer.join()


def run_polling_based_watcher(config: dict):
    watch_config = config["watch"]
    watch_path = os.path.abspath(watch_config["path"])

    names = os.listdir(watch_path)
    for name in names:
        src_path = os.path.join(watch_path, name)
        handle(src_path, config)


def init_watcher(config: dict):
    os.makedirs(config["data"]["path"], exist_ok=True)
    os.makedirs(config["watch"]["path"], exist_ok=True)
    init_logger_with_handlers("cleaner", logging.DEBUG, config["log"]["cleaner"])


run_watcher = run_polling_based_watcher
