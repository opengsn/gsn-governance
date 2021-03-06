const ethereumjsUtil = require('ethereumjs-util')
const assert = require('assert')
const fs = require('fs')
const recipients = require('../deploy-scripts/recipients')

const GSNToken = artifacts.require('GSNToken')
let Timelock = artifacts.require('Timelock')
const Multicall = artifacts.require('Multicall')
let GovernorAlpha = artifacts.require('GovernorAlpha')
const TreasuryVester = artifacts.require('TreasuryVester')

module.exports = async function (deployer, network, accounts) {

  const account = accounts[0]
  const minter = accounts[0]

  const trustedForwarder = process.env.ForwarderAddress

  const mintingAllowedAfter = Date.now() + 1
  await deployer.deploy(GSNToken, account, minter, mintingAllowedAfter, trustedForwarder)
  const transactionCount = await web3.eth.getTransactionCount(account)
  const futureGovernorAddress = ethereumjsUtil.bufferToHex(ethereumjsUtil.generateAddress(
    ethereumjsUtil.toBuffer(account),
    ethereumjsUtil.toBuffer(transactionCount + 1)))

  let delay = 172800
  if ( !process.env.IS_MAINNET ) {

    console.log('== test network: use GovernorAlphaDebug/TimelockDebug, with short delays (minutes, instead of weeks)')
    delay = 60
  }
  await deployer.deploy(Timelock, futureGovernorAddress, delay)
  await deployer.deploy(GovernorAlpha, Timelock.address, GSNToken.address, trustedForwarder)

  assert.equal(GovernorAlpha.address.toLowerCase(), futureGovernorAddress, 'calculated governor address does not match')

  const gsnToken = await GSNToken.deployed()

  outputs={
    TIMELOCK: Timelock.address,
    GOVERNOR: GovernorAlpha.address,
    GSNTOKEN: GSNToken.address
  }

  // amounts are given in % of supply in "wei". there are 10 million base tokens (10^25 wei) in each %
  const totalSupply = await gsnToken.totalSupply()

  function percentToWei (pct) {
    return totalSupply.muln(Math.round(parseFloat(pct) * 1000)).divn(100000)
  }

  let distributedPercent = 0
  for (const recipient of recipients) {
    distributedPercent += parseFloat(recipient.vestingAmount)
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

    outputs["VESTER_"+recipient.name.toUpperCase()] = contract.address
    console.log('Deployed TreasuryVester for ', recipient.name, ':', contract.address)
  }

  const outfile = process.env.GOV_OUT
  if (outfile) {
    console.log('== writing addresses to',outfile)
    fs.writeFileSync(outfile,
        `# network ${process.env.NETWORK} mainnet=${process.env.IS_MAINNET}\n` +
        Object.entries(outputs).map(([k,v])=>`export ${k}="${v}"`).join('\n'))
  }

  console.log(`=== distributed ${distributedPercent}% of total supply to vesting contracts`)
  if (network === 'development') {
    await deployer.deploy(Multicall)
  }
}
