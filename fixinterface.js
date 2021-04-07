const fs = require('fs')

const GSNToken = artifacts.require('GSNToken')
const Timelock = artifacts.require('Timelock')
const GovernorAlpha = artifacts.require('GovernorAlpha')
const Multicall = artifacts.require('Multicall')

// Transfer non-vested tokens
module.exports = async function (callback) {

  fs.writeFileSync( '../gsn-governance-interface/src/constants/deployed_addresses.ts',
`
//This file was auto-generated by deploy script.
//date: ${new Date()}
export const GOVERNANCE_ADDRESS = '${GovernorAlpha.address}'
export const TIMELOCK_ADDRESS = '${Timelock.address}'
export const UNI_ADDRESS = '${GSNToken.address}'

//for ganache, we also deploy multicall contract. on other networks it is pre-deployed
export const GANACHE_MULTICALL = '${Multicall.address}'
`)
  callback()
}