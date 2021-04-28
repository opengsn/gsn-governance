source gov-conf.sh  
source $GSN_OUT
source $GOV_OUT 
source sponsors-conf.sh
source $SPONSORS_OUT
truffle exec tokensummary.js "$@"
