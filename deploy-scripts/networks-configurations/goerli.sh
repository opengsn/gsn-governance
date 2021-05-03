#ropsten configuration file.
# pass as parameter to ./1-deploy-gsn.sh  ./2-start-relay.sh
export DEPLOY_DIR=`pwd`/goerli-deploy
mkdir -p $DEPLOY_DIR

export NETWORK='goerli'

export GAS_PRICE_GWEI=1
export GAS_LIMIT=5000000

export MNEMONIC_FILE=~/secret-mnemonic.txt

export GSN_OUT=$DEPLOY_DIR/gsn-out.sh

export INFURA_ID='f40be2b1a3914db682491dc62a19ad43'
