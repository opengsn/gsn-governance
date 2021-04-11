#!/bin/bash -xe
cd `dirname $0`

source gov-conf.sh
source $GSN_OUT
source $AIRDROP_OUT

## transfer tokens to their destinations
truffle exec --network $NETWORK ./distribute.js

