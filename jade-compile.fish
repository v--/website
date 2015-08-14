#!/usr/bin/env fish

jade views $argv
rm -r html
cp -r views html
rm views/**.html
rm html/_**.html
rm html/**.jade
