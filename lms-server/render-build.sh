#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
# Store/Download Chrome
npx puppeteer browsers install chrome
