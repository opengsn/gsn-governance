#!/bin/bash -xe

cd `dirname $0`
source gov-conf.sh
cd ../../gsn


if [ $NETWORK == 'development' ] ; then
    GSNNETWORK="--network local"
else
    GSNNETWORK="--network $NETWORK --mnemonic $MNEMONIC_FILE"
fi

if [ $NETWORK != 'mainnet' ] ; then
  YES=--yes
fi

node ./packages/cli/dist/commands/gsn.js deploy $YES --gasPrice $GASPRICE_GWEI --registryHubId hub $GSNNETWORK

(
echo "export GSNNETWORK=\"$GSNNETWORK\""
for c in RelayHub Forwarder Paymaster StakeManager Penalizer VersionRegistry ; do
echo export ${c}Address=`jq < build/gsn/$c.json .address` >> $GSN_OUT
done
) > $GSN_OUT

cd -
