const ethereumjsUtil = require('ethereumjs-util')
const assert = require('assert')

const recipients = require('../recipients')

const GSNToken = artifacts.require('GSNToken')
const Timelock = artifacts.require('Timelock')
const Multicall = artifacts.require('Multicall')
const GovernorAlpha = artifacts.require('GovernorAlpha')
const TreasuryVester = artifacts.require('TreasuryVester')

module.exports = async function (deployer, network, accounts) {

  const account = accounts[0]
  const minter = accounts[0]

  const trustedForwarder = process.env.FORWARDER

  const mintingAllowedAfter = Date.now() + 1
  await deployer.deploy(GSNToken, account, minter, mintingAllowedAfter, trustedForwarder)
  const transactionCount = await web3.eth.getTransactionCount(account)
  const futureGovernorAddress = ethereumjsUtil.bufferToHex(ethereumjsUtil.generateAddress(
    ethereumjsUtil.toBuffer(account),
    ethereumjsUtil.toBuffer(transactionCount + 1)))
  const delay = process.env.NETWORK === 'development' ? 60 : 172800
  await deployer.deploy(Timelock, futureGovernorAddress, delay)
  await deployer.deploy(GovernorAlpha, Timelock.address, GSNToken.address, trustedForwarder)

  assert.equal(GovernorAlpha.address.toLowerCase(), futureGovernorAddress, 'calculated governor address does not match')

  const gsnToken = await GSNToken.deployed()

  // amounts are given in % of supply in "wei". there are 10 million base tokens (10^25 wei) in each %
  const totalSupply = await gsnToken.totalSupply()

  function percentToWei (pct) {
    return totalSupply.muln(Math.round(parseFloat(pct) * 1000)).divn(100000)
  }

  for (const recipient of recipients) {
    const vestingAmountBN = percentToWei(recipient.vestingAmount)
    const approveTo = recipient.canBeCancelled ? Timelock.address : '0x0000000000000000000000000000000000000000'
    const recipientAddress = recipient.recipient === 'timelock' ? Timelock.address : recipient.recipient

    const contract = await deployer.deploy(TreasuryVester,
      gsnToken.address,
      recipientAddress,
      approveTo,
      vestingAmountBN,
      recipient.vestingBegin,
      recipient.vestingCliff,
      recipient.vestingEnd,
      recipient.canVote)
    await gsnToken.transfer(contract.address, vestingAmountBN)

    console.log('Deployed TreasuryVester for ', recipient.name, ':', contract.address)
  }

  if (network === 'development') {
    await deployer.deploy(Multicall)
  }
}
