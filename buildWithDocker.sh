#!/usr/bin/env bash

set -eux

docker build --tag jsi-builder --file build/Dockerfile . 1>&2
mkdir -p dist/bin
docker run --rm jsi-builder > dist/bin/jsi
chmod +x dist/bin/jsi
