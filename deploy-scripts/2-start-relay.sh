#!/bin/bash -xe
cd `dirname $0`

#parameter is configuration file
source $1
source $GSN_OUT

#owner is the address of our mnemonic file:
export RELAY_OWNER=`truffle exec --network $NETWORK senderaddr.js|perl -ne 'print $1 if /SENDER=(.*)/'`

if [ -z "$RELAY_OWNER" ]; then
	echo ERROR unable tot find owner address
	exit 1
fi

if [ -z "$NODEURL" ]; then
  if [ $NETWORK == "development" ]; then
    NODEURL="http://$RELAY_HOST:8545"
  else
    NODEURL="https://$NETWORK.infura.io/v3/$INFURA_ID"
  fi
fi

mkdir -p $DEPLOY_DIR/relay/config

cat <<EOF > $DEPLOY_DIR/relay/config/gsn-relay-config.json
{
  "baseRelayFee": 0,
  "pctRelayFee": 70,
  "versionRegistryAddress": "$VersionRegistryAddress",
  "ownerAddress": "$RELAY_OWNER",
  "gasPriceFactor": 1,
  "confirmationsNeeded": 1,
  "ethereumNodeUrl": "$NODEURL"
}
EOF

cat <<EOF > $DEPLOY_DIR/relay/.env
HOST=$RELAY_HOST
HTTPS_STAGE=production
EOF


if [ $NETWORK == "development" ]; then

echo === develeopment mode incomplete.
exit 1

    # on development server, start docker on localhost
    # (just make sure to use self ip, not 127.0.0.1)
  docker rm -f gsnrelay
  docker run -d \
    --name gsnrelay \
    -v `pwd`:`pwd` -w `pwd`/$DEPLOY_DIR/relay \
    -p 8090:8090 \
    -e port=8090 \
    -e relayHubId=hub \
    -e workdir=./gsndata \
    -e config=./config/gsn-relay-config.json \
    -e url=$RELAY_URL \
    opengsn/jsrelay

  echo "To see the relay logs, run:"
  echo "   docker logs -t -f gsnrelay"
  sleep 5

  node ../../gsn/packages/cli/dist/commands/gsn.js relayer-register --gasPrice $GAS_PRICE_GWEI --relayUrl $RELAY_URL

else

  (cd $DEPLOY_DIR/relay; scp -r .env config $RELAY_HOST: )

RELAYDC_TAG=:2.2.0  ../../gsn/dockers/relaydc/rdc $RELAY_HOST up -d

  echo "To see the relay logs, run:"
  echo "   ../../gsn/dockers/relaydc/rdc $RELAY_HOST logs -t"

  echo "waiting for http service to start"
  while ! ../../gsn/dockers/relaydc/rdc $RELAY_HOST logs|grep "Signed certificate for $RELAY_HOST"; do sleep 5; done
  sleep 5

  node ../../gsn/packages/cli/dist/commands/gsn.js relayer-register --network $NODEURL --gasPrice $GAS_PRICE_GWEI --relayUrl $RELAY_URL -m $MNEMONIC_FILE --funds 0.5 --from $RELAY_OWNER

fi


