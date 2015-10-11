#!/usr/bin/env bash

trap "echo Aborting; exit" INT

cd $(dirname ${BASH_SOURCE[0]})
ROOT=/srv/http/ivasilev/

function section {
    echo -e "\x1b[32;1m$1\x1b[0m"
}

function action {
    echo -e "  \x1b[33;1m$1\x1b[0m"
    $1
}

section "Preparing..."
action "npm install"
action "bower install"
action "dub build -b release"
action "gulp prod"

section "Deploying..."
action "ssh ivasilev.net systemctl stop vibed"
action "ssh ivasilev.net rm -r $ROOT/ivasilev $ROOT/html $ROOT/config $ROOT/public"
action "scp -rC ivasilev html config public ivasilev.net:$ROOT"
action "ssh ivasilev.net chown website:website $ROOT -R"
action "ssh ivasilev.net systemctl restart vibed nginx"

section "Finished..."
