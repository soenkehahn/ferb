#!/usr/bin/env bash

set -o errexit
set -o xtrace

docker build --tag jsi-builder --file build/Dockerfile .
INSTALL_GOOS=$(uname | awk '{print tolower($0)}')
docker run --rm --env INSTALL_GOOS=$INSTALL_GOOS jsi-builder > dist.tar
rm -rf dist
tar xvf dist.tar

if [ -z "$1" ]; then
  PREFIX=/usr/local
else
  PREFIX="$1"
fi

cp dist/bin/jsi "$PREFIX"/bin/
