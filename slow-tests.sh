#!/usr/bin/env bash

set -o errexit

export CLEAR_CACHE=true
yarn jest --runInBand --silent
