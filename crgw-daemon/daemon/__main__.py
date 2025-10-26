import logging
import os
import signal
from time import sleep

import requests
from requests import ConnectionError
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from commmons import init_logger_with_handlers
from urllib3.exceptions import MaxRetryError, NewConnectionError

from cleaner import init_cleaner
from cleaner.local_file_cleaner import run_local_file_cleaner
from cleaner.tag_cleaner import run_tag_cleaner
from config.config import get_config
from scraper.scraper import init_scraper, run_scraper
from watcher.watcher import init_watcher, run_watcher

LOGGER = logging.getLogger("daemon")
scheduler = BackgroundScheduler()


# Job configuration: (func, interval_seconds or None for one-time)
DAEMON_JOBS = [
    (init_watcher, None),
    (init_cleaner, None),
    # (init_scraper, None),
    (run_watcher, 1800),
    (run_tag_cleaner, 1800),
    (run_local_file_cleaner, 1800),
    # (run_scraper, 86400),
]


def wait_until_api_ready():
    while True:
        try:
            r = requests.get("http://api/health/ready")
            status = r.status_code
        except (MaxRetryError, ConnectionRefusedError, NewConnectionError, ConnectionError):
            status = 500

        if status == 200:
            LOGGER.info("API ready. Now starting daemon jobs.")
            break

        LOGGER.info("API not ready. Sleeping for 5 seconds...")
        sleep(5)


def run_daemon():
    wait_until_api_ready()

    config = get_config()
    os.makedirs(config["data"]["path"], exist_ok=True)
    init_logger_with_handlers("daemon", logging.DEBUG, config["log"]["daemon"])

    # Add jobs to the scheduler
    for func, interval in DAEMON_JOBS:
        if interval:
            # Recurring job
            scheduler.add_job(
                func,
                trigger=IntervalTrigger(seconds=interval),
                args=(config,),
                id=func.__name__,
                name=f"Recurring: {func.__name__}",
                replace_existing=True,
            )
            LOGGER.info(f"Scheduled recurring job: {func.__name__} every {interval} seconds")
        else:
            # One-time job
            scheduler.add_job(
                func,
                args=(config,),
                id=func.__name__,
                name=f"One-time: {func.__name__}",
                replace_existing=True,
            )
            LOGGER.info(f"Scheduled one-time job: {func.__name__}")

    # Start the scheduler
    scheduler.start()
    LOGGER.info("APScheduler started. Running daemon jobs.")

    # Handle graceful shutdown
    def signal_handler(sig, frame):
        LOGGER.info("Received shutdown signal. Shutting down scheduler...")
        scheduler.shutdown(wait=True)
        LOGGER.info("Scheduler shut down. Exiting.")

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        # Keep the main thread alive
        while scheduler.running:
            sleep(1)
    except KeyboardInterrupt:
        LOGGER.info("Keyboard interrupt received.")
        scheduler.shutdown(wait=True)


if __name__ == "__main__":
    run_daemon()
