#!/bin/bash -xe


cd `dirname $0`
#parameter is configuration file
source $1
cd ../../gsn

if [ -n "$NODEURL" ]; then
  GSN_NETWORK="--network $NODEURL"
else
  if [ $NETWORK != 'development' ] ; then
      GSN_NETWORK="--network $NETWORK"
  else
      GSN_NETWORK="--network localhost"
  fi
fi

if [ -n "$MNEMONIC_FILE" ]; then
    GSN_MNEMONIC="--mnemonic $MNEMONIC_FILE"
fi

node ./packages/cli/dist/commands/gsn.js deploy --yes --gasPrice $GAS_PRICE_GWEI --registryHubId hub --testPaymaster $GSN_NETWORK $GSN_MNEMONIC

(
echo "#network $NETWORK"
echo "export GSN_NETWORK=\"$GSN_NETWORK\""
for c in RelayHub Forwarder Paymaster StakeManager Penalizer VersionRegistry ; do
echo export ${c}Address=`jq < build/gsn/$c.json .address` >> $GSN_OUT
done
) > $GSN_OUT

cd -
