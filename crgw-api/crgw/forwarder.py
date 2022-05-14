import base64
import os

import requests
from pydash import url as pydash_url

ALLOWED_FWD_HEADERS = ("rangeend", "rangestart", "content-type", "order", "nexttoken", "crg-method", "crg-body")


def forward_request(data, headers: dict, method: str, subpath: str):
    assert "CRG_REMOTE_HOST" in os.environ
    assert "CRG_REMOTE_APIKEY" in os.environ

    url = pydash_url(os.environ["CRG_REMOTE_HOST"], subpath)
    headers = {k.lower(): v for k, v in headers.items() if k.lower() in ALLOWED_FWD_HEADERS}
    headers["apikey"] = os.environ["CRG_REMOTE_APIKEY"]

    if "crg-method" in headers:
        assert "crg-body" in headers
        method = headers.pop("crg-method")
        headers["Content-Type"] = "application/json"
        data = base64.b64decode(headers.pop("crg-body").encode()).decode().encode('utf-8')

    r = requests.request(url=url, method=method, data=data, headers=headers)
    return r.content, r.status_code, dict(r.headers)