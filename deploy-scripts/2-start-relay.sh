#!/bin/bash -xe
cd `dirname $0`

source gov-conf.sh
source $GSN_OUT

if [ $NETWORK == "development" ]; then
  NODEURL="http://$RELAY_HOST:8545"
else
  NODEURL="https://$NETWORK.infura.io/v3/INFURA_ID"
fi

mkdir -p tmp/relay/config

cat <<EOF > tmp/relay/config/gsn-relay-config.json
{
  "baseRelayFee": 0,
  "pctRelayFee": 70,
  "relayHubAddress": "$RelayHubAddress",
  "stakeManagerAddress": "$StakeManagerAddress",
  "ownerAddress": "$RELAY_OWNER",
  "gasPriceFactor": 1,
  "confirmationsNeeded": 1,
  "ethereumNodeUrl": "$NODEURL"
}
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

  $SSH xxxx

fi

node ../../gsn/packages/cli/dist/commands/gsn.js relayer-register $GSNNETWORK --relayUrl $RELAY_URL

