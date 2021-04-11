#!/bin/bash -xe
cd `dirname $0`

source gov-conf.sh
source $GSN_OUT
source $AIRDROP_OUT

truffle exec --network $NETWORK ./fixinterface.js

# create airdrop frontend
cd ../../gsn-airdrop
yarn run build
echo === airdrop UI in `pwd`/packages/react-app/build
surge packages/react-app/build/ $AIRDROP_DNS
cd -

# create voting frontend
cd ../../gsn-governance-interface/
yarn run build
echo === voting frontend in `pwd`/build
surge build/ $VOTE_DNS
cd -
