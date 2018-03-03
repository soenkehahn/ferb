#!/usr/bin/env bash

set -eux

mkdir -p dist/bin

function compile () {
  TARGET=dist/bin/jsi-$GOOS-$GOARCH
  go build -o $TARGET src/jsi.go
  if [ $GOOS == "linux" ]; then
    upx $TARGET 1>&2
  fi
  echo compiled $TARGET 1>&2
}

export GOOS=linux
export GOARCH=amd64
compile

export GOOS=darwin
export GOARCH=amd64
compile

if [ -z "${INSTALL_GOOS:-}" ]; then
  INSTALL_GOOS=$(uname | awk '{print tolower($0)}')
fi
INSTALL_GOARCH=amd64
cp dist/bin/jsi-$INSTALL_GOOS-$INSTALL_GOARCH dist/bin/jsi
