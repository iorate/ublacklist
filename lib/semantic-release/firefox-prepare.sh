#!/bin/sh

cd dist/firefox/production

jq ".version|=\"$1\"" manifest.json > manifest.json.new
mv manifest.json.new manifest.json

zip -r "../../../ublacklist-v$1-firefox.zip" *
