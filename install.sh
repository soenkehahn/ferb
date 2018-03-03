#!/usr/bin/env bash

set -o errexit

docker build --tag jsi-builder --file build/Dockerfile .
mkdir -p dist/bin
docker run --rm jsi-builder > dist/bin/jsi
chmod +x dist/bin/jsi

if [ -z "$1" ]; then
  PREFIX=/usr/local
else
  PREFIX="$1"
fi

cp dist/bin/jsi "$PREFIX"/bin/
