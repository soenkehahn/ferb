!#/usr/bin/env bash

set -eux

docker build --tag jsi-builder build
docker run --rm --volume $(pwd):/root/jsi jsi-builder
