#!/bin/bash -xe
cd `dirname $0`

source gov-conf.sh
source $GSN_OUT
source $GOV_OUT

# write output to AIRDROP_OUT
yarn --cwd ../../gsn-airdrop deploy
yarn --cwd ../../gsn-airdrop build

