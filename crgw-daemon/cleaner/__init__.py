import os


def init_cleaner(config: dict):
    os.makedirs(config["data"]["path"], exist_ok=True)
