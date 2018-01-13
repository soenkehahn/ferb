#!/usr/bin/env bash

set -o errexit

flow

export CLEAR_CACHE=true
jest
