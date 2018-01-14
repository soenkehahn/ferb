#!/usr/bin/env bash

set -o errexit

./build.sh

if [ -z "$1" ]; then
  PREFIX=/usr/local
else
  PREFIX="$1"
fi

cp dist/bin/jsi "$PREFIX"/bin/
