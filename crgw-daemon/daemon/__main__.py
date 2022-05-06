from dataclasses import dataclass, field
from threading import Thread
from time import sleep
from typing import Callable

from commmons import touch_directory

from cleaner.cleaner import run_cleaner, init_cleaner
from config.config import get_config
from scraper.scraper import init_scraper, run_scraper
from watcher.watcher import init_watcher, run_watcher


@dataclass
class DaemonJob:
    func: Callable[[dict], None]  # argument is 'config'
    interval: int = field(default=None)  # Seconds

    @property
    def repeated_func(self):
        if not self.interval:
            return self.func

        def repeated_func(config: dict):
            # TODO: use a timer instead of a loop
            while True:
                self.func(config)
                sleep(self.interval)

        return repeated_func


DAEMON_JOBS = [
    DaemonJob(func=init_watcher),
    DaemonJob(func=init_cleaner),
    DaemonJob(func=init_scraper),
    DaemonJob(func=run_watcher, interval=60),
    DaemonJob(func=run_cleaner, interval=1800),
    DaemonJob(func=run_scraper, interval=1800),
]


def run_daemon():
    config = get_config()
    touch_directory(config["data"]["path"])

    threads = []

    for job in DAEMON_JOBS:
        t = Thread(target=job.repeated_func, args=(config,))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()


if __name__ == "__main__":
    run_daemon()
