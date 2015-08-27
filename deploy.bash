#!/usr/bin/env bash

cd $(dirname ${BASH_SOURCE[0]})

echo 'Preparing...'
echo ' npm install'
npm install
echo ' bower install'
bower install
echo ' Building the backend'
dub build -c release
echo ' Building the frontend'
gulp prod

echo 'Deploying...'
echo ' Stopping the server'
ssh ivasilev.net systemctl stop vibed
echo ' Syncing the application'
scp -C ivasilev ivasilev.net:/srv/http/ivasilev
echo ' Syncing the public folder'
scp -rC public ivasilev.net:/srv/http/ivasilev
echo ' Syncing the configuration'
scp -rC config ivasilev.net:/srv/http/ivasilev
echo ' Syncing the views'
scp -rC html ivasilev.net:/srv/http/ivasilev
echo ' Setting permissions'
ssh ivasilev.net chown website:website /srv/http/ivasilev -R
echo ' Starting the server'
ssh ivasilev.net systemctl start vibed
