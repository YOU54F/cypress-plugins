#!/bin/bash

echo 'attempting to remove cypress-lambda container...'
docker rm cypress-lambda

echo 'running cypress-lambda container for a sec...'
docker run --name cypress-lambda cypress-lambda sleep 1

echo 'snagging the tarball...'
docker cp  cypress-lambda:/app/lib.tar.gz .

echo 'and node modules and Xvfb...'
docker cp -L cypress-lambda:/app/node_modules .
docker cp -L cypress-lambda:/usr/bin/Xvfb .

echo 'done'
