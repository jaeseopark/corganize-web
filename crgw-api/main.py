import logging

from flask import Flask, request as freq, Response

from crgw.filemod import create_subclip
from crgw.forwarder import forward_request
from crgw.local_filesystem import get_local_files, teardown, add_local_files

logging.basicConfig(format="%(asctime)s %(levelname)s thread=%(thread)d %(module)s.%(funcName)s %(message)s")
logging.root.setLevel(logging.INFO)

# TODO: add logging.FileHandler
LOGGER = logging.getLogger(__name__)

app = Flask(__name__)


@app.get("/files")
def get_files():
    files = get_local_files()
    return dict(files=files), 200


@app.post("/files")
def add_files():
    add_local_files(freq.get_json())
    return "", 200


@app.post("/files/<path:fileid>/split")
def split_file(fileid: str):
    start = int(freq.args.get("start"))
    end = int(freq.args.get("end"))
    try:
        file = create_subclip(fileid, (start, end))
    except FileNotFoundError:
        return "", 404
    return file, 200


@app.get("/health/ready")
def health_ready():
    files = get_local_files()
    status = 200 if len(files) > 0 else 503
    return "", status


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

    content, status_code, headers = forward_request(freq.data, dict(freq.headers), freq.method, subpath)

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
