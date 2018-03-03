#!/usr/bin/env bash

set -eux

for f in examples/*js; do
  echo running $f...
  ./$f
done
