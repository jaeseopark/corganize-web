import base64
import logging
import os

import requests
from pydash import url as pydash_url

ALLOWED_FWD_HEADERS = ("content-type", "order", "nexttoken", "crg-method", "crg-body", "authorization")
LOGGER = logging.getLogger("crgw-api")


def forward_request(data, headers: dict, method: str, subpath: str, params: dict, cookies: dict):
    assert "CRG_REMOTE_HOST" in os.environ

    url = pydash_url(os.environ["CRG_REMOTE_HOST"], subpath)
    headers = {k.lower(): v for k, v in headers.items() if k.lower() in ALLOWED_FWD_HEADERS}

    if "crg-method" in headers:
        assert "crg-body" in headers
        method = headers.pop("crg-method")
        headers["Content-Type"] = "application/json"
        data = base64.b64decode(headers.pop("crg-body").encode()).decode().encode('utf-8')

    LOGGER.info(f"{url=} {method=} {headers=} {params=}")

    with requests.session() as s:
        if cookies:
            s.cookies.update(cookies)
        r = s.request(url=url, method=method, data=data, headers=headers, params=params)
        return r.content, r.status_code, dict(r.headers)
