#!/bin/bash -xe
#parse output of "ganache --verbose", and extract all eth_sendRawTransaction values
#output single line for each raw transaction

cat $1 | sed -ne 's/^ *>//p' | jq -S 'select(.method=="eth_sendRawTransaction") | .params[0]'