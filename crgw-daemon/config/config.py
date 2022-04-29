import io
import os

import yaml
from commmons import merge

_OVERRIDE_PATH = "/mnt/config.yml"

_DEFAULT = """
log:
  path: /mnt/watcher.log
data:
  path: /data
watch:
  path: /watch
  type: polling
  polling:
    interval: 60  # Seconds
  watchdog:
    recursive: false
    handler:
      case_sensitive: true
      ignore_directories: false
server:
  host: ""
  apikey: ""
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
