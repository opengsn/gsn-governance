const ethereumjsUtil = require('ethereumjs-util')
const assert = require('assert')

const Uni = artifacts.require('Uni')
const Timelock = artifacts.require('Timelock')
const Multicall = artifacts.require('Multicall')
const GovernorAlpha = artifacts.require('GovernorAlpha')
const TreasuryVester = artifacts.require('TreasuryVester')

module.exports = async function (deployer, network, accounts) {
  const account = accounts[0]
  const minter = accounts[0]
  const trustedForwarder = '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab'
  const mintingAllowedAfter = Date.now() + 1
  await deployer.deploy(Uni, account, minter, mintingAllowedAfter, trustedForwarder)
  const transactionCount = await web3.eth.getTransactionCount(account)
  const futureGovernorAddress = ethereumjsUtil.bufferToHex(ethereumjsUtil.generateAddress(
    ethereumjsUtil.toBuffer(account),
    ethereumjsUtil.toBuffer(transactionCount + 1)))
  const delay = 172800
  await deployer.deploy(Timelock, futureGovernorAddress, delay)
  await deployer.deploy(GovernorAlpha, Timelock.address, Uni.address)

  assert.equal(GovernorAlpha.address.toLowerCase(), futureGovernorAddress, 'calculated governor address does not match')

  const recipients = [
    {
      address: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
      vestingAmount: '100'
    }
  ]
  const vestingBegin = Date.now() + 1
  const vestingCliff = Date.now() + 100
  const vestingEnd = Date.now() + 1000
  const canVote = true

  for (const recipient of recipients) {
    await deployer.deploy(TreasuryVester,
      Uni.address,
      recipient.address,
      recipient.vestingAmount,
      vestingBegin,
      vestingCliff,
      vestingEnd,
      canVote)
  }

  if (network === 'development'){
    await deployer.deploy(Multicall)
  }
}
