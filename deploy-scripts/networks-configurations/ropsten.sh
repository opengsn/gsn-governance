#ropsten configuration file.
# pass as parameter to ./1-deploy-gsn.sh  ./2-start-relay.sh
export DEPLOY_DIR=`pwd`/ropsten-deploy
mkdir -p $DEPLOY_DIR

export NETWORK='ropsten'
export RELAY_HOST="rp22.relays.opengsn.org"

export GAS_PRICE_GWEI=10
export GAS_LIMIT=1000000

export MNEMONIC_FILE=~/.secret/mainnet-mnemonic.txt

export GSN_OUT=$DEPLOY_DIR/gsn-out.sh

export INFURA_ID='f40be2b1a3914db682491dc62a19ad43'

export RELAY_URL="https://$RELAY_HOST/gsn1"
