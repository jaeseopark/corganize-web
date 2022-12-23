import json
import logging
from typing import List

from commmons import init_logger_with_handlers
from flask import Flask, request as freq, Response
from hypersquirrel.entry import create_watchlist, scrape

from crgw.postprocessing import cut_individually, cut_merge, reencode
from crgw.forwarder import forward_request
from crgw.local_filesystem import get_local_files, get_remaining_space, teardown, add_local_files

LOGGER = init_logger_with_handlers("crgw-api", logging.INFO, "/var/log/crgw-api/api.log")

app = Flask(__name__)


@app.get("/files")
def get_files():
    files = get_local_files()
    return dict(files=files), 200


@app.post("/files")
def add_files():
    add_local_files(freq.get_json())
    return "", 200


@app.post("/files/<path:fileid>/cut")
def cut(fileid: str):
    try:
        files: List[dict] = cut_individually(fileid, freq.get_json().get("segments"))
    except FileNotFoundError as e:
        return str(e), 404

    res = Response(json.dumps(files))
    res.headers = {"Content-Type": "application/json"}
    res.status_code = 200
    return res


@app.post("/files/<path:fileid>/cut-merge")
def cut_mergee(fileid: str):
    try:
        file: dict = cut_merge(fileid, freq.get_json().get("segments"))
    except FileNotFoundError as e:
        return str(e), 404
    return file, 200

@app.post("/files/<path:fileid>/reencode")
def reencodee(fileid: str):
    # TODO: spin up a thread
    try:
        reencode(fileid, **freq.get_json())
    except FileNotFoundError as e:
        return str(e), 404
    return "", 201


@app.get("/health/ready")
def health_ready():
    files = get_local_files()
    status = 200 if len(files) > 0 else 503
    return "", status


@app.get("/info")
def health_info():
    # TODO: convert to ws:// and keep sending events to the clients.
    res = dict(
        remainingSpace=get_remaining_space(),
        fileCount=len(get_local_files())
    )
    return res, 200

@app.post("/scrape")
def scrapeee():
    body = freq.get_json()
    url = body.get("url").lstrip("vpr://")
    LOGGER.info(f"scraping {url=}")
    max_items = body.get("max_items")
    files = list(scrape(create_watchlist(url, max_items)))
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

    content, status_code, headers = forward_request(
        freq.data,
        dict(freq.headers),
        freq.method,
        subpath,
        dict(freq.args)
    )

    res = Response(content)
    res.headers = headers
    res.status_code = status_code
    return res


if __name__ == '__main__':
    # This block is only for the dev env.
    try:
        app.run(host="0.0.0.0", port=80)
    except (KeyboardInterrupt, SystemExit):
        teardown()
