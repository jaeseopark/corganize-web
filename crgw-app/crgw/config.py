import io
import os

import yaml
from commmons import merge

_OVERRIDE_PATH = "/mnt/config.yml"

_DEFAULT = """
local:
  path: /data
  sleep_seconds: 1800
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

    return _INSTANCE
