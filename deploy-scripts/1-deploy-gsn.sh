#!/bin/bash -xe

cd `dirname $0`
source gov-conf.sh
cd ../../gsn

if [ $NETWORK != 'development' ] ; then
    GSN_NETWORK="--network $NETWORK"
else
    GSN_NETWORK="--network localhost"
fi

if [ -n "$MNEMONIC_FILE" ]; then
    GSN_MNEMONIC="--mnemonic $MNEMONIC_FILE"
fi

node ./packages/cli/dist/commands/gsn.js deploy --yes --gasPrice $GAS_PRICE_GWEI --registryHubId hub $GSN_NETWORK $GSN_MNEMONIC

(
echo "#network $NETWORK"
echo "export GSN_NETWORK=\"$GSN_NETWORK\""
for c in RelayHub Forwarder Paymaster StakeManager Penalizer VersionRegistry ; do
echo export ${c}Address=`jq < build/gsn/$c.json .address` >> $GSN_OUT
done
) > $GSN_OUT

cd -
