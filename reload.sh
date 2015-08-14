#!/usr/bin/env sh
dub build --compiler=dmd
killall ivasilev
./ivasilev&
