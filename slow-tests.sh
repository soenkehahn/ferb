#!/usr/bin/env bash

set -eux

export CLEAR_CACHE=true
yarn jest --runInBand
