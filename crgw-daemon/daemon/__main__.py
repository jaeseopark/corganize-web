from threading import Thread
from watcher.watcher import run_watcher


def run_daemon():
    t = Thread(target=run_watcher)
    t.start()
    t.join()


if __name__ == "__main__":
    run_daemon()
