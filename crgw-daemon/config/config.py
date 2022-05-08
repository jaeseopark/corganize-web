import io
import os

import yaml
from commmons import merge

_OVERRIDE_PATH = "/mnt/config.yml"

_DEFAULT = """
server:
  host: ""
  apikey: ""
log:
  all: /mnt/logs/all.log
  watcher: /mnt/logs/watcher.log
  cleaner: /mnt/logs/cleaner.log
  scraper: /mnt/logs/scraper.log
data:
  path: /mnt/data
watch:
  path: /mnt/downloads/complete
  watchdog:
    recursive: false
    handler:
      case_sensitive: true
      ignore_directories: false
scrape:
  entries:
    - url: PLACEHOLDER
      max_items: 5
  quick_dedup:
    query_limit: 5000
  blacklist:
  - PLACEHOLDER
"""

_INSTANCE = dict()


def _get_default_config() -> dict:
    with io.StringIO(_DEFAULT) as fp:
        return yaml.safe_load(fp)


def _get_override() -> dict:
    override_path = os.getenv("CONFIG_OVERRIDE_PATH") or _OVERRIDE_PATH
    if os.path.exists(override_path):
        with open(override_path) as fp:
            return yaml.safe_load(fp)

    return dict()


def get_config() -> dict:
    if len(_INSTANCE) == 0:
        _INSTANCE.update(merge(
            _get_default_config(),
            _get_override()
        ))
        if not _INSTANCE["server"]["host"] or not _INSTANCE["server"]["apikey"]:
            raise RuntimeError("Server information must be provided")

    return _INSTANCE
