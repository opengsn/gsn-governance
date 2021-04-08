#!/bin/bash -xe

NETWORK='rinkeby'

truffle exec --network $NETWORK ./fixinterface.js

# create airdrop frontend
cd ../gsn-airdrop
yarn run build
echo === airdrop UI in `pwd`/packages/react-app/build
surge packages/react-app/build/ gsn-airdrop.surge.sh
cd -

# create voting frontend
cd ../gsn-governance-interface/
yarn run build
echo === voting frontend in `pwd`/build
surge build/ gsn-voting.surge.sh
cd -
