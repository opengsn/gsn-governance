#!/bin/bash -xe
# demo shell script

# deploy team multisig contract (Gnosis Safe proxy can be created in GUI first)
# cd safe-contracts
NETWORK='rinkeby'
GSNNETWORK='rinkeby'

export INFURA_ID='f40be2b1a3914db682491dc62a19ad43'
# vesting is applied to 90% of allocated tokens, and 10% of tokens are released instantly

# team

export TEAM_MULTISIG='0xd21934eD8eAf27a67f0A70042Af50A1D6d195E81'
export TEAM_AMOUNT='17.55' # amounts are in % of supply
export TEAM_AMOUNT_NO_VEST='1.95'

# sponsors

# TODO: these are ganache addresses 8 & 9 for now...
export EF_MULTISIG='0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E'
export EF_AMOUNT='9'
export EF_AMOUNT_NO_VEST='1'

export ETC_MULTISIG='0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e'
export ETC_AMOUNT='4.05'
export ETC_AMOUNT_NO_VEST='0.45'

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

export AIRDROP_AMOUNT='6'

# GSN with new
cd ../gsn-private
node dist/src/cli/commands/gsn.js deploy --yes --network $GSNNETWORK --mnemonic secretMnemonic.txt
export FORWARDER=`jq < ./build/gsn/Forwarder.json -r  .address`
export RELAYHUB=`jq < ./build/gsn/RelayHub.json -r  .address`

echo "=== FORWARDER=$FORWARDER"
echo "=== RELAYHUB=$RELAYHUB"
cd -

test -n "$FORWARDER" || exit 1

# deploy governance contracts
NETWORK=$NETWORK yarn deploy

# deploy airdrop
cd ../gsn-airdrop

#AIRDROP=$(truffle migrate --network $NETWORK)
#yarn deploy takes env "NETWORK"
# uniq needed: dry-run might emit it multiple times.
AIRDROP=$(NETWORK=$NETWORK yarn deploy | grep AIRDROP_TAG | uniq | awk '{print $2}')
export AIRDROP
echo "$AIRDROP"

cd -

## transfer tokens to their destinations
truffle exec --network $NETWORK ./distribute.js

# set GSN owner to timelock
truffle exec --network $NETWORK ./gsn-setowner.js

./govinterface.sh
