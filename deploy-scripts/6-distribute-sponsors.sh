#!/bin/bash -xe
cd `dirname $0`

source gov-conf.sh
source $GOV_OUT
source sponsors-conf.sh

## transfer tokens to their destinations
truffle exec --network $NETWORK ./sponsors-distribute.js
