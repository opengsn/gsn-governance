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

  const trustedForwarder = '0x7Fe7c7B71E9882651c14D5771ECAa06cC6b27882'
  const mintingAllowedAfter = Date.now() + 1
  await deployer.deploy(Uni, account, minter, mintingAllowedAfter, trustedForwarder)
  const transactionCount = await web3.eth.getTransactionCount(account)
  const futureGovernorAddress = ethereumjsUtil.bufferToHex(ethereumjsUtil.generateAddress(
    ethereumjsUtil.toBuffer(account),
    ethereumjsUtil.toBuffer(transactionCount + 1)))
  const delay = 172800
  await deployer.deploy(Timelock, futureGovernorAddress, delay)
  await deployer.deploy(GovernorAlpha, Timelock.address, Uni.address, trustedForwarder)

  assert.equal(GovernorAlpha.address.toLowerCase(), futureGovernorAddress, 'calculated governor address does not match')

  const recipients = [
    {
      address: '0xd21934eD8eAf27a67f0A70042Af50A1D6d195E81',
      vestingAmount: '10000'
    },
    {
      address: '0x7149173Ed76363649675C3D0684cd4Bac5A1006d',
      vestingAmount: '10000'
    },
    {
      address: '0xF61591e478f83C14C22DF18A21AdcA24037005DD',
      vestingAmount: '10000'
    }
  ]
  const vestingBegin = Date.now() + 1
  const vestingCliff = Date.now() + 200
  const vestingEnd = Date.now() + 3600
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
