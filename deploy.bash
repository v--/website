#!/usr/bin/env bash

cd $(dirname ${BASH_SOURCE[0]})

echo 'Preparing...'
echo ' npm install'
npm install
echo ' bower install'
bower install
echo ' Building the assets'
brunch build -P
echo ' Building the binary'
dub build --build=release --compiler=dmd
echo ' Building the views'
jade views -o html

echo 'Deploying...'
echo ' Stopping the server'
ssh ivasilev.net systemctl stop vibed
echo ' Syncing the application'
scp -C ivasilev ivasilev.net:/srv/http/ivasilev
echo ' Syncing the public folder'
scp -rC public ivasilev.net:/srv/http/ivasilev
echo ' Syncing the nginx conf'
scp -rC slides ivasilev.net:/srv/http/ivasilev
echo ' Syncing the views'
scp -Cr html ivasilev.net:/srv/http/ivasilev
echo ' Setting permissions'
ssh ivasilev.net chown website:website /srv/http/ivasilev -R
echo ' Starting the server'
ssh ivasilev.net systemctl start vibed
