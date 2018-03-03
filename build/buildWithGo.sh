#!/usr/bin/env bash

set -o errexit

mkdir -p dist/bin
go build -o dist/bin/jsi src/jsi.go
upx dist/bin/jsi 1>&2
echo compiled jsi 1>&2
