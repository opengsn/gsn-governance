#!/bin/bash -e

cd `dirname $0`
source gov-conf.sh
cd ../../gsn


if [ $NETWORK == 'development' ] ; then
    GSNNETWORK="--network local"
else
    GSNNETWORK="--network $NETWORK --mnemonic $MNEMONIC_FILE"
fi

node ./packages/cli/dist/commands/gsn.js deploy --yes --registryHubId hub $GSNNETWORK

(
echo export GSNNETWORK="$GSNNETWORK"
for c in RelayHub Forwarder Paymaster StakeManager Penalizer VersionRegistry ; do
echo export ${c}Address=`jq < build/gsn/$c.json .address` >> $GSN_OUT
done
) > $GSN_OUT

cd -
