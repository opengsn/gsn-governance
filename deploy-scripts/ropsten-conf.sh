#ropsten configuration file.
# pass as parameter to ./1-deploy-gsn.sh  ./2-start-relay.sh

#utility function
function fatal {
  echo "FATAL: $*"
  exit 1
}

export DEPLOY_DIR=`pwd`/ropsten-deploy
mkdir -p $DEPLOY_DIR

#development, rinkeby, mainnet
# forked network is still 'development'
#export NETWORK='development'
export NETWORK='ropsten'
export RELAY_HOST="rp22.relays.opengsn.org"

export GAS_PRICE_GWEI=10
export GAS_LIMIT=1000000

# force using mnemonic file
#export MNEMONIC_FILE=`pwd`/secretMnemonic.txt
export MNEMONIC_FILE=~/.secret/mainnet-mnemonic.txt

export GSN_OUT=$DEPLOY_DIR/gsn-out.sh


#if [ $NETWORK != 'development' ] ; then

  export INFURA_ID='f40be2b1a3914db682491dc62a19ad43'

  export RELAY_URL="https://$RELAY_HOST/gsn1"

#else
#
#  #on development, need to be host ip. this works on mac..
#  export RELAY_HOST=`ifconfig|grep -v 127.0.0.1| awk '/inet / {print $2}'`
#  export RELAY_URL="http://$RELAY_HOST:8090"
#  #default to ganache address1
#  export RELAY_OWNER="0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
#
#fi

