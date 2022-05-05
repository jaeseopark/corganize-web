from threading import Thread

from commmons import touch_directory

from config.config import get_config

from cleaner.cleaner import run_cleaner, init_cleaner_logger, init_cleaner_fs
from watcher.watcher import run_watcher, init_watcher_logger, init_watcher_fs

MODULES = (
    (init_cleaner_fs, init_cleaner_logger, run_cleaner),
    (init_watcher_fs, init_watcher_logger, run_watcher)
)


def run_daemon():
    config = get_config()
    touch_directory(config["data"]["path"])

    threads = []

    for init_fs, init_logger, run_module in MODULES:
        init_fs(config)
        init_logger(config)
        t = Thread(target=run_module, args=(config,))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()


if __name__ == "__main__":
    run_daemon()
