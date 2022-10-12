#!/usr/bin/env bash

# Add required webfonts locally to src/static/fonts/ directory.
mkdir ./static/
mkdir ./static/fonts
cd ./static/fonts
curl 'https://github.com/cfpb/consumerfinance.gov/blob/main/static.in/cfgov-fonts/fonts/2cd55546-ec00-4af9-aeca-4a3cd186da53.woff2?raw=true' --output '1e9892c0-6927-4412-9874-1b82801ba47a.woff'
curl 'https://github.com/cfpb/consumerfinance.gov/blob/main/static.in/cfgov-fonts/fonts/2cd55546-ec00-4af9-aeca-4a3cd186da53.woff2?raw=true' --output '2cd55546-ec00-4af9-aeca-4a3cd186da53.woff2'
curl 'https://github.com/cfpb/consumerfinance.gov/blob/main/static.in/cfgov-fonts/fonts/627fbb5a-3bae-4cd9-b617-2f923e29d55e.woff2?raw=true' --output '627fbb5a-3bae-4cd9-b617-2f923e29d55e.woff2'
curl 'https://github.com/cfpb/consumerfinance.gov/blob/main/static.in/cfgov-fonts/fonts/627fbb5a-3bae-4cd9-b617-2f923e29d55e.woff2?raw=true' --output 'f26faddb-86cc-4477-a253-1e1287684336.woff'
cd ../../
