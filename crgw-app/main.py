import base64
import logging
import os
from urllib.parse import unquote_plus

import requests
from flask import Flask, request as freq, Response
from pydash import url

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
    assert "CRG_REMOTE_APIKEY" in os.environ
    ALLOWED_HEADERS = ("rangeend", "rangestart", "content-type", "order", "nexttoken", "crg-method", "crg-body")

    urll = url(os.environ["CRG_REMOTE_HOST"], subpath)

    headers = {k.lower(): v for k, v in dict(freq.headers).items() if k.lower() in ALLOWED_HEADERS}
    headers["apikey"] = os.environ["CRG_REMOTE_APIKEY"]

    method = freq.method
    data = freq.data
    if "crg-method" in headers:
        assert "crg-body" in headers
        method = headers.pop("crg-method")
        headers["Content-Type"] = "application/json"
        data = base64.b64decode(headers.pop("crg-body").encode()).decode().encode('utf-8')

    r = requests.request(url=urll, method=method, data=data, headers=headers)

    res = Response(r.content)
    res.headers = dict(r.headers)
    res.status_code = r.status_code
    return res


if __name__ == '__main__':
    # This block is only for the dev env.
    try:
        app.run(host="0.0.0.0", port=80)
    except (KeyboardInterrupt, SystemExit):
        teardown()
