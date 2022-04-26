import logging
import os
from copy import deepcopy
from urllib.parse import urljoin

import requests
from flask import Flask, request as freq

from crgw.handlers import get_local_files, teardown

logging.basicConfig(format="%(asctime)s %(levelname)s thread=%(thread)d %(module)s.%(funcName)s %(message)s")
logging.root.setLevel(logging.INFO)

# TODO: add logging.FileHandler
LOGGER = logging.getLogger(__name__)

app = Flask(__name__)


@app.get("/files")
def get_files():
    files = get_local_files()
    return dict(files=files), 200


@app.route("/remote/<path:subpath>")
def fwd_remote(subpath: str):
    """
    A workaround for the following issue:
      RFC 1945 and RFC 2068 specify that the client is not allowed
      to change the method on the redirected request.  However, most
      existing user agent implementations treat 302 as if it were a 303
      response, performing a GET on the Location field-value regardless
      of the original request method.

      https://www.rfc-editor.org/rfc/rfc2616#section-10.3.3
    """

    assert "CRG_REMOTE_HOST" in os.environ
    assert "CRG_REOMTE_APIKEY" in os.environ

    url = urljoin(os.environ["CRG_REMOTE_HOST"], subpath)
    headers = deepcopy(freq.headers)
    headers["apikey"] = os.environ["CRG_REOMTE_APIKEY"]

    r = requests.request(url=url, method=freq.method, data=freq.data, headers=headers)
    return r.content, r.status_code, r.headers


@app.post("/scrape/<path:subpath>")
def fwd_scrape(subpath: str):
    assert "SCRAPE_HOST" in os.environ

    url = urljoin(os.environ["SCRAPE_HOST"], subpath)
    r = requests.post(url=url, data=freq.data, headers=freq.headers)
    return r.content, r.status_code, r.headers


if __name__ == '__main__':
    # This block is only for the dev env.
    try:
        app.run(host="0.0.0.0", port=80)
    except (KeyboardInterrupt, SystemExit):
        teardown()
