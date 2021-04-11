#!/bin/bash -e
cd `dirname $0`

source gov-conf.sh
source $GSN_OUT

if [ $NETWORK == "development" ]; then
  NODEURL="http://$RELAY_HOST:8545"
else
  NODEURL="https://$NETWORK.infura.io/v3/$INFURA_ID"
fi

mkdir -p tmp/relay/config

cat <<EOF > tmp/relay/config/gsn-relay-config.json
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

cat <<EOF > tmp/relay/.env
HOST=$RELAY_HOST
HTTPS_STAGE=production
EOF


if [ $NETWORK == "development" ]; then

    # on development server, start docker on localhost
    # (just make sure to use self ip, not 127.0.0.1)
  docker rm -f gsnrelay
  docker run -d \
    --name gsnrelay \
    -v `pwd`:`pwd` -w `pwd`/tmp/relay \
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

else

  (cd tmp/relay; scp -r .env config $RELAY_HOST: )

RELAYDC_TAG=:2.2.0  ../../gsn/dockers/relaydc/rdc $RELAY_HOST up -d

  echo "To see the relay logs, run:"
  echo "   ../../gsn/dockers/relaydc/rdc $RELAY_HOST logs -t"

  echo "waiting for http service to start"
  while ! ../../gsn/dockers/relaydc/rdc $RELAY_HOST logs|grep "$RELAY_HOST verified"; do sleep 5; done
  sleep 5

fi

node ../../gsn/packages/cli/dist/commands/gsn.js relayer-register $GSNNETWORK --gasPrice $GASPRICE_GWEI --relayUrl $RELAY_URL

