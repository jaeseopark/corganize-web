FROM python:3.10-slim-bullseye

# Install dependencies
WORKDIR /tmp/install
COPY requirements.txt setup.py ./
RUN pip install -r requirements.txt

# Install app module
COPY config/ config/
COPY daemon/ daemon/
COPY watcher/ watcher/
COPY cleaner/ cleaner/
RUN python setup.py install

# Cleanup
RUN rm -rf /tmp/install

WORKDIR /app
