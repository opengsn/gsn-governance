#!/bin/bash -xe
cd `dirname $0`

source gov-conf.sh
source $GSN_OUT

if [ -z "$IS_MAINNET" ] ; then
  echo "== DEBUG: modify Timelock, GovernorAlpha to accept minute delays (instead of week)"
  perl -pi -e  's!2 days!1 minutes /* DEBUG - NO\GIT */ !' ../contracts/Timelock.sol
  perl -pi -e  's!40_320!15 /* DEBUG - 3 minutes - NO\GIT */ !' ../contracts/GovernorAlpha.sol

  grep -q DEBUG ../contracts/Timelock.sol || fatal failed to patch Timelock.
  grep -q DEBUG ../contracts/GovernorAlpha.sol || fatal failed to patch GovernorAlpha.
else
  grep -q DEBUG ../contracts/Timelock.sol && fatal Mainnet deployment with DEBUG-patched Timelock.
  grep -q DEBUG ../contracts/GovernorAlpha.sol && fatal Mainnet deployment with DEBUG-patched GovernorAlpha.
fi

# deploy governance contracts
yarn --cwd .. deploy

# write output to AIRDROP_OUT
#yarn --cwd ../../gsn-airdrop deploy

# set GSN owner to timelock
#truffle exec --network $NETWORK ./gsn-setowner.js

cd -
