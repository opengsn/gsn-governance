#xdai configuration file.
# pass as parameter to ./1-deploy-gsn.sh  ./2-start-relay.sh

export DEPLOY_DIR=`pwd`/xdai-deploy
mkdir -p $DEPLOY_DIR

export NETWORK='xdai'
export RELAY_HOST="xdai_2_2_0.instance_1.relays.opengsn.org"

export GAS_PRICE_GWEI=1
export GAS_LIMIT=5000000

export MNEMONIC_FILE=~/secret-mnemonic.txt

export GSN_OUT=$DEPLOY_DIR/gsn-out.sh
export RELAY_URL="https://$RELAY_HOST/gsn1"

