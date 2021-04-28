#!/bin/bash -xe
cd `dirname $0`

source gov-conf.sh
source $GOV_OUT
source vested-airdrop-conf.sh

## transfer tokens to their destinations
truffle exec --network $NETWORK ./vested-airdrop-distribute.js
