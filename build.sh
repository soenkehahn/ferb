#!/usr/bin/env bash

set -o errexit

mkdir -p dist/bin
go build -o dist/bin/jsi src/jsi.go
