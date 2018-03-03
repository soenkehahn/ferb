#!/usr/bin/env bash

set -eux

rm dist.tar -f
rm dist -rf
rm ~/.local/bin/jsi -f

./install.sh ~/.local
./examples/factorial.js

echo success!!!
