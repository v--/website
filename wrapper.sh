#!/usr/bin/env sh
sh ./reload.sh
find source | entr sh ./reload.sh
