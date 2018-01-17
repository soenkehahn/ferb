#!/usr/bin/env bash

set -o errexit

if !(go version | grep --quiet go1.8); then
  echo go version not supported
  exit 1
fi

mkdir -p dist/bin
go build -o dist/bin/jsi src/jsi.go
upx dist/bin/jsi
echo compiled jsi
