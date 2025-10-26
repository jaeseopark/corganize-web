FROM python:3.14-slim-trixie

# Install dependencies
WORKDIR /tmp/install
COPY requirements.txt setup.py ./
RUN pip install setuptools && pip install -r requirements.txt

# Install app module
COPY config/ config/
COPY daemon/ daemon/
COPY watcher/ watcher/
COPY cleaner/ cleaner/
COPY scraper/ scraper/
RUN python setup.py install

# Cleanup
RUN rm -rf /tmp/install

WORKDIR /app
