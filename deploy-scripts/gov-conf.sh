#gov configuration file.
# "sourced" into the script, so all items should be exported

#utility function
function fatal {
  echo "FATAL: $*"
  exit 1
}

# deploy team multisig contract (Gnosis Safe proxy can be created in GUI first)
# cd safe-contracts

export DEPLOY_DIR=`pwd`/deploy
mkdir -p $DEPLOY_DIR

#development, rinkeby, mainnet
export NETWORK='development'
#export NETWORK='rinkeby'

export GASPRICE_GWEI=10

export GSN_OUT=$DEPLOY_DIR/gsn-out.sh
export AIRDROP_OUT=$DEPLOY_DIR/airdrop-out.sh
export GOV_OUT=$DEPLOY_DIR/gov-out.sh

if [ $NETWORK != 'development' ] ; then

  # only have mnemonic file in external networks
  export MNEMONIC_FILE=`pwd`/secretMnemonic.txt
  test -r $MNEMONIC_FILE || fatal "no such file: MNEMONIC_FILE=$MNEMONIC_FILE"

  #should match the mnemonic file
  export RELAY_OWNER=xxxxx

  export INFURA_ID='f40be2b1a3914db682491dc62a19ad43'

  export RELAY_HOST="grink22.relays.opengsn.org"
  export RELAY_URL="https://$RELAY_HOST/gsn1"

else

  #on development, need to be host ip. this works on mac..
  export RELAY_HOST=`ifconfig|grep -v 127.0.0.1| awk '/inet / {print $2}'`
  export RELAY_URL="http://$RELAY_HOST:8090"
  #default to ganache address1
  export RELAY_OWNER="0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"

fi

# for testing, can set DNS names to any unique name under surge.sh
AIRDROP_DNS=gsn-airdrop.surge.sh
VOTE_DNS=gsn-voting.surge.sh

# vesting is applied to 90% of allocated tokens, and 10% of tokens are released instantly

# team

export TEAM_MULTISIG='0x63c0A0f420A5aA2d803Ea30d35f961baf33DdFc1'
export TEAM_AMOUNT='17.55' # amounts are in % of supply
export TEAM_AMOUNT_NO_VEST='1.95'

# sponsors

#export EF_MULTISIG='0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E'
#export EF_AMOUNT='9'
#export EF_AMOUNT_NO_VEST='1'

#export ETC_MULTISIG='0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e'
#export ETC_AMOUNT='4.05'
#export ETC_AMOUNT_NO_VEST='0.45'

# ecosystem and charity

export CHARITY_MULTISIG='0x28a8746e75304c0780E011BEd21C72cD78cd535E'
export CHARITY_AMOUNT='0.9'
export CHARITY_AMOUNT_NO_VEST='0.1'

export ECOSYSTEM_MULTISIG='0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9'
export ECOSYSTEM_AMOUNT='4.5'
export ECOSYSTEM_AMOUNT_NO_VEST='0.5'

# total 'community pool' is 60%
export COMMUNITY_NO_VEST='5.4'

export COMMUNITY_YEAR_1_AMOUNT='16.2'
export COMMUNITY_YEAR_2_AMOUNT='16.2'
export COMMUNITY_YEAR_3_AMOUNT='10.8'
export COMMUNITY_YEAR_4_AMOUNT='5.4'

#export AIRDROP_AMOUNT='6'

export EXPECTED_EXCESS_TOKENS='20.5'
